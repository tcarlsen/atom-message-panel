"use strict";

var
  View = require('atom').View,
  inherits = require('./utils').inherits;

var LineMessageView = function (params) {
  this.line = params.line;
  this.character = params.character || undefined;
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
  atom.workspace.getActiveEditor().cursors[0].setBufferPosition([this.line - 1, char]);
};

LineMessageView.prototype.initialize = function () {
  var message = 'at line ' + this.line;
  if (this.character !== undefined) {
    message += ', character ' + this.character;
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
  return {
    summary: pos + ': ' + this.message,
    className: this.className
  };
};

module.exports = LineMessageView;
