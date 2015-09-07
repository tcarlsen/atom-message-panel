"use strict";

var
  View = require('space-pen').View,
  inherits = require('./utils').inherits,
  Path = require('path'),
  Point = require('atom').Point,
  $ = require('space-pen').$;

var LineMessageView = function (params) {
  this.line = parseInt(params.line, 10);
  this.character = params.character ? parseInt(params.character, 10) : undefined;
  this.file = params.file || undefined;
  this.message = params.message;
  this.preview = params.preview || undefined;
  this.className = params.className || undefined;

  View.apply(this, arguments);
};

inherits(LineMessageView, View);

LineMessageView.content = function () {
  this.div({
    class: 'line-message'
  }, function () {
    this.div({
      class: 'text-subtle inline-block',
      outlet: 'position',
      click: 'goToLine',
      style: 'cursor: pointer;'
    });
    this.div({
      class: 'message inline-block',
      outlet: 'contents'
    });
    this.pre({
      class: 'preview',
      outlet: 'code',
      click: 'goToLine',
      style: 'cursor: pointer;'
    });
  }.bind(this));
};

LineMessageView.prototype.isHighlighted = function () {
  return this.hasClass('highlight');
};

LineMessageView.prototype.getCursorPoint = function () {
  var
    char = (this.character !== undefined) ? this.character - 1 : 0,
    line = this.line - 1;
  return new Point(line, char);
};

LineMessageView.prototype.goToLine = function () {
  var point = this.getCursorPoint(),
    activeFile,
    activeEditor = atom.workspace.getActiveTextEditor();
  if (activeEditor !== undefined && activeEditor !== null) {
    activeFile = Path.relative(atom.project.rootDirectories[0].path, activeEditor.getURI());
  }

  if (this.file !== undefined && this.file !== activeFile) {
    atom.workspace.open(this.file, {
      initialLine: point.row,
      initialColumn: point.column
    }).then(function (editor) {
      editor.scrollToBufferPosition(point);
      editor.setCursorBufferPosition(point);
    });
  } else {
    atom.workspace.getActiveTextEditor().setCursorBufferPosition(point);
  }
};

LineMessageView.prototype.initialize = function () {
  var message = 'at line ' + this.line;
  if (this.character !== undefined) {
    message += ', character ' + this.character;
  }
  if (this.file !== undefined) {
    message += ', file ' + this.file;
  }
  this.position.text(message);
  this.contents.text(this.message);
  if (this.className) {
    this.contents.addClass(this.className);
  }

  if (this.preview) {
    this.code.text(this.preview);
  } else {
    this.code.remove();
  }
};

LineMessageView.prototype.getSummary = function () {
  var pos = this.line;
  if (this.character !== undefined) {
    pos += ', ' + this.character;
  }
  if (this.file !== undefined) {
    pos += ', ' + this.file;
  }
  return {
    summary: '<span>' + pos + '</span>: ' + this.message,
    rawSummary: true,
    className: this.className,
    handler: function (element) {
      $('span', element)
        .css('cursor', 'pointer')
        .click(this.goToLine.bind(this));
    }.bind(this)
  };
};

module.exports = LineMessageView;
