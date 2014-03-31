"use strict";

var
  View = require('atom').View,
  inherits = require('./utils').inherits;

var LineMessageView = function (params) {
  this.line = params.line;
  this.character = params.character;
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
  atom.workspace.getActiveEditor().cursors[0].setBufferPosition([this.line - 1, this.character - 1]);
};

LineMessageView.prototype.initialize = function () {
  this.position.text('at line ' + this.line + ', character ' + this.character);
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
  return {
    summary: this.line + ', ' + this.character + ': ' + this.message,
    className: this.className
  };
};

module.exports = LineMessageView;
