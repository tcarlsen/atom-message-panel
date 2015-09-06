temp = require('temp').track()
{MessagePanelView, PlainMessageView, LineMessageView} = require '../lib'
path = require 'path'
deepEqual = require 'deep-equal'

describe "MessagePanelView: message navigation", ->
  projectRoot = temp.mkdirSync()
  widgetContent = """
                  widget first line Mark1
                  widget second Mark2 line
                  widget third
                  widget fourth line Mark4A Mark4B
                  """
  gerbilContent = """
                  gerbil first
                  gerbil second
                  gerbil third Mark3
                  gerbil fourth
                  gerbil Mark5 fifth
                  """

  editors = { }
  [workspaceElement, messagePanel, widgetMarks, gerbilMarks] = []

  triggerCommand = (command) ->
    atom.commands.dispatch(workspaceElement, command)

  nextMessage = -> triggerCommand('message-panel:next-message')
  prevMessage = -> triggerCommand('message-panel:previous-message')

  findEditor = (filename) ->
    for editor in atom.workspace.getTextEditors()
      return editor if path.relative(projectRoot, editor.getURI()) is filename

  loadEditor = (name, text) ->
    openedEditor = undefined
    waitsForPromise ->
      atom.workspace.open("zap/test.#{name}").then (e) ->
        openedEditor = e
        e.setText(text)
    runs ->
      editors[name] = openedEditor

  loadMarks = (editor) ->
    text = editor.getText()
    markOffsets = []
    index = -1
    while (index = text.indexOf("Mark", index + 1)) != -1
      markOffsets.push(index)

    buffer = editor.getBuffer()
    file = path.relative(projectRoot, editor.getURI())
    for offset in markOffsets
      pos = buffer.positionForCharacterIndex(offset)
      new LineMessageView
        file: file
        line: pos.row + 1
        character: pos.column + 1

  cursorToText = (editor, findText) ->
    text = editor.getText()
    pos = text.indexOf(findText)
    if pos != -1
      editor.setCursorBufferPosition(
        editor.getBuffer().positionForCharacterIndex(pos))
    else
      throw("Can't find #{findText} in #{editor.getURI()}")

  cursorAt = (editor, message) ->
    deepEqual(editor.getCursorBufferPosition(), message.getCursorPoint())

  cursorAtHighlighted = (editor, message) ->
    cursorAt(editor, message) and message.isHighlighted()

  # Waits for the assertion to hold
  waitExpects = (msg) ->
    (fn, time=500) ->
      waitsFor(fn, msg, time)
      runs -> expect(fn()).toBe(true)

  beforeEach ->
    workspaceElement ?= atom.views.getView(atom.workspace)
    atom.project.setPaths([projectRoot])
    loadEditor('widget', widgetContent)
    loadEditor('gerbil', gerbilContent)
    runs ->
      widgetMarks = loadMarks(editors.widget)
      gerbilMarks = loadMarks(editors.gerbil)

  beforeEach ->
    messagePanel = new MessagePanelView
      title: "Test panel"
      closeMethod: 'destroy'
    for mark in widgetMarks
      messagePanel.add(mark)
    messagePanel.add(
      new PlainMessageView(message: "Spoiler; should be ignored"))
    for mark in gerbilMarks
      messagePanel.add(mark)
    messagePanel.attach()

  afterEach ->
    messagePanel.close()

  describe "message navigation using message-panel:next-message", ->
    it "will visit the first mark on the first next-message command", ->
      runs -> nextMessage()
      waitExpects("cursor to first mark") ->
        cursorAtHighlighted(editors.widget, widgetMarks[0])

    it "will cycle forward through messages", ->
      runs -> nextMessage()
      waitExpects("cursor to mark 1") ->
        cursorAtHighlighted(editors.widget, widgetMarks[0])
      runs -> nextMessage()
      waitExpects("cursor to mark 2") ->
        cursorAtHighlighted(editors.widget, widgetMarks[1])
      runs -> nextMessage()
      waitExpects("cursor to mark 3") ->
        cursorAtHighlighted(editors.widget, widgetMarks[2])

    it ("will jump to the next file when the current message " +
        "is the last in the current file"), ->
      runs ->
        editors.widget.setCursorBufferPosition(
          widgetMarks[widgetMarks.length - 1].getCursorPoint())
      # Moving cursor to the line should have selected the *first* message on
      # that line, so trigger nextMessage() twice
      runs -> nextMessage()
      waitExpects("cursor to last mark") ->
        cursorAtHighlighted(editors.widget, widgetMarks[widgetMarks.length - 1])
      runs -> nextMessage()
      waitExpects("gerbil editor active") ->
        atom.workspace.getActiveTextEditor() == editors.gerbil
      waitExpects("cursor at first gerbil mark") ->
        cursorAtHighlighted(editors.gerbil, gerbilMarks[0])

    it "will wrap back to the first message when advancing from the last", ->
      runs ->
        editors.gerbil.setCursorBufferPosition(
          gerbilMarks[gerbilMarks.length - 1].getCursorPoint())
      runs -> nextMessage()
      waitExpects("widget editor active") ->
        atom.workspace.getActiveTextEditor() == editors.widget
      waitExpects("cursor at first widget mark") ->
        cursorAtHighlighted(editors.widget, widgetMarks[0])

  describe "message navigation using message-panel:previous-message", ->
    it "will visit the last mark on the first previous-message command", ->
      prevMessage()
      waitExpects("cursor at last gerbil mark") ->
        cursorAtHighlighted(editors.gerbil, gerbilMarks[gerbilMarks.length - 1])

    it "will cycle backward through messages", ->
      runs -> prevMessage()
      waitExpects("cursor at last gerbil mark") ->
        cursorAtHighlighted(editors.gerbil, gerbilMarks[gerbilMarks.length - 1])
      runs -> prevMessage()
      waitExpects("cursor at last-1 gerbil mark") ->
        cursorAtHighlighted(editors.gerbil, gerbilMarks[gerbilMarks.length - 2])
      runs -> prevMessage()
      waitExpects("cursor at last widget mark") ->
        atom.workspace.getActiveTextEditor() == editors.widget and
        cursorAtHighlighted(editors.widget, widgetMarks[widgetMarks.length - 1])

    it "will jump to the previous file when at the first message", ->
      runs ->
        editors.gerbil.setCursorBufferPosition(
          gerbilMarks[0].getCursorPoint())
      runs -> prevMessage()
      waitExpects("cursor at last widget mark") ->
        cursorAtHighlighted(editors.widget, widgetMarks[widgetMarks.length - 1])

  describe "highlight on manual navigation", ->
    it "will highlight a message when the cursor is on the same line", ->
      runs -> editors.widget.setCursorBufferPosition([0, 0])
      waitExpects("first message to be highlighted") ->
        highlighted = messagePanel.getHighlightedMessages()
        highlighted.length == 1 && highlighted[0] == widgetMarks[0]

    it "will highlight all messages on the line with the cursor", ->
      runs ->
        editors.widget.setCursorBufferPosition(
          widgetMarks[widgetMarks.length - 1].getCursorPoint())
      waitExpects("last two messages to be highlighted") ->
        deepEqual(messagePanel.getHighlightedMessages(),
                  widgetMarks.slice(widgetMarks.length - 2))

    it "will clear highlights when the cursor is on a line with no messages", ->
      runs ->
        editors.widget.setCursorBufferPosition(
          widgetMarks[widgetMarks.length - 1].getCursorPoint())
      waitExpects("last two messages to be highlighted") ->
        deepEqual(messagePanel.getHighlightedMessages(),
                  widgetMarks.slice(widgetMarks.length - 2))
      runs ->
        cursorToText(editors.widget, "widget third")
      waitExpects("no messages to be highlighted") ->
        messagePanel.getHighlightedMessages().length == 0
