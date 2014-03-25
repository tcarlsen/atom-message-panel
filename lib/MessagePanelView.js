"use strict";

var View = require('atom').View,
    inherits = require('./utils').inherits;

/**
 * Class MessagePanelView.
 *
 * Is the container-view for the smaller
 * *MessageView-classes which can be added using the
 * `add`-method.
 * The title can be changed after adding by calling
 * the `setTitle` function.
 *
 * Takes a hash of settings that include:
 * - `title`: The title of the pane
 * - `rawTitle`: `true` allows the title to contains HTML
 * - `speed`: The jQuery effect-speed that folding uses
 */
function MessagePanelView(params) {
    this.title = params.title;
    this.rawTitle = params.rawTitle || false;
    this.speed = params.speed || 'fast';
    this.messages = [];

    View.apply(this, arguments);
}
inherits(MessagePanelView, View);

MessagePanelView.content = function () {
    this.div({class: 'am-panel tool-panel panel-bottom'}, function () {
        this.div({class: 'panel-heading'}, function () {
            this.div({class: 'heading-title inline-block', outlet: 'heading'});
            this.div({class: 'heading-summary inline-block', outlet: 'summary'});
            this.div({class: 'heading-buttoms inline-block pull-right'}, function () {
                this.div({class: 'heading-fold inline-block icon-fold', style: 'cursor: pointer', outlet: 'btnFold', click: 'toggle'});
                this.div({class: 'heading-close inline-block icon-remove-close', style: 'cursor: pointer;', outlet: 'btnClose', click: 'close'});
            }.bind(this));
        }.bind(this));
        this.div({class: 'panel-body padded', outlet: 'body', style: 'max-height:170px;overflow-y:scroll;'});
    }.bind(this));
};

MessagePanelView.prototype.attach = function () {
    atom.workspaceView.prependToBottom(this);
};

MessagePanelView.prototype.close = function () {
    this.detach();
};

MessagePanelView.prototype.initialize = function () {
    this.setTitle(this.title, this.rawTitle);
    this.summary.hide();
};

MessagePanelView.prototype.setTitle = function (title, raw) {
    if (raw) {
        this.heading.html(title);
    } else {
        this.heading.text(title);
    }
};

MessagePanelView.prototype.setSummary = function (summary, className) {
    // Reset the class-attributes on the old summary
    this.summary.attr('class', 'heading-summary inline-block');
    // Set the new summary
    this.summary.text(summary);
    if (className) {
        this.summary.addClass(className);
    }
};

MessagePanelView.prototype.toggle = function () {
    this.btnFold.toggleClass('icon-fold, icon-unfold');
    this.body.toggle(this.speed);
    // Because we want to toggle between display:
    // 'none' and 'inline-block' for the summary,
    // we can't use .toggle().
    if (this.summary.css('display') === 'none') {
        this.summary.css('display', 'inline-block');
    } else {
        this.summary.hide();
    }
};

MessagePanelView.prototype.clear = function () {
    this.messages = [];
    this.body.empty();
};

MessagePanelView.prototype.add = function (view) {
    if (this.messages.length === 0 && view.getSummary) {
        // This is the first message, so use it to
        // set the summary
        var summary = view.getSummary();
        this.setSummary(summary.summary, summary.className);
    }
    this.messages.push(view);
    this.body.append(view);
};

module.exports = MessagePanelView;
