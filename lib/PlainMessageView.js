/*globals require, module, atom*/
"use strict";

var View = require('atom').View,
    inherits = require('./utils').inherits;

/**
 * The PlainMessageView class
 *
 * A standard message without any
 * formatting.
 *
 * Takes a hash of options that include:
 * - `message`: The message to display
 * - `raw`: `true` allows the message to contain HTML
 * - `className`: Optionally adds a class-name
 */
function PlainMessageView(params) {
    View.apply(this, arguments);
    this.message = params.message;
    this.raw = params.raw || false;
    this.className = params.className || undefined;
}
inherits(PlainMessageView, View);

PlainMessageView.content = function () {
    this.div({class: 'plain-message'});
};

PlainMessageView.prototype.afterAttach = function () {
    if (this.raw) {
        this.html(this.message);
    } else {
        this.text(this.message);
    }

    if (this.className) {
        this.addClass(this.className);
    }
};

PlainMessageView.prototype.getSummary = function () {
    return {summary: this.message, className: this.className};
};

module.exports = PlainMessageView;
