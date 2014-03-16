/*globals require, module, atom*/
"use strict";

var View = require('atom').View,
    inherits = require('./utils').inherits;

/**
 * LineMessageView class
 *
 * Is capable of displaying a message with a line:char
 * reference, and an optional preview of the code on
 * that line.
 *
 * Takes a hash of parameters that include:
 * - `line`: The line this message relates to
 * - `character`: Which character on the line
 * - `message`: The message itself
 * - `preview`: An optional preview of the code
 * - `className`: Optionally adds a class-name
 */
function LineMessageView(params) {
    View.apply(this);
    this.line = params.line;
    this.character = params.character;
    this.message = params.message;
    this.preview = params.preview || undefined;
    this.className = params.className || undefined;
}
inherits(LineMessageView, View);

LineMessageView.content = function() {
    this.div({class: 'line-message'}, function() {
        this.div({class: 'text-subtle inline-block', outlet: 'position', click: 'goToLine', style: 'cursor: pointer;'});
        this.div({class: 'message inline-block', outlet: 'contents'});
        this.pre({class: 'preview', outlet: 'code', click: 'goToLine', style: 'cursor: pointer;'});
    }.bind(this));
};

LineMessageView.prototype.goToLine = function() {
    atom.workspace.getActiveEditor().cursors[0].setBufferPosition([this.line - 1, this.character - 1]);
};

LineMessageView.prototype.afterAttach = function() {
    this.position.text('at line ' + this.line + ', character ' + this.character);
    this.contents.text(this.message);
    if (this.className)
        this.contents.addClass(this.className);
    if (this.preview) this.code.text(this.preview);
    else this.code.remove();
};

LineMessageView.prototype.getSummary = function() {
  return {
      summary: this.line + ', ' + this.character + ': ' + this.message,
      className: this.className
  };
};

module.exports = LineMessageView;
