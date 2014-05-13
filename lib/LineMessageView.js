"use strict";

var
  View = require('atom').View,
  inherits = require('./utils').inherits,
  Path = require('path'),
  $ = require('atom').$;

var LineMessageView = function (params) {
  this.line = params.line;
  this.character = params.character || undefined;
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

LineMessageView.prototype.goToLine = function () {
  var char = (this.character !== undefined) ? this.character - 1 : 0;
  var activeFile;
  var activeEditor =  atom.workspace.getActiveEditor();
  if (typeof activeEditor !== "undefined" && activeEditor !== null) {
    activeFile = Path.relative( atom.project.rootDirectory.path, activeEditor.getUri() );
  }

  if (this.file !== undefined && this.file !== activeFile) {
    atom.workspace.open(this.file, {initialLine: this.line - 1});
  } else {
    atom.workspace.getActiveEditor().cursors[0].setBufferPosition([this.line - 1, char]);
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
