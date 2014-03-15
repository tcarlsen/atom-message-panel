/*globals require, module, atom*/

/**
 * The Atom Message Panel library.
 * Contains a MessagePaneView and a couple of
 * *MessageView classes that can combine to
 * display assorted messages.
 *
 * Usage (JavaScript):
 *
 * var MessagePanelView = require('atom-message-panel').MessagePanelView
 *   , PlainMessageView = require('atom-message-panel').PlainMessageView;
 * var messages = new MessagePanelView({title: 'My first panel!'});
 * messages.attach();
 * messages.add(new PlainMessageView({message: 'With my first message'}));
 *
 * Usage (CoffeeScript):
 * {MessagePanelView, LineMessageView} = require 'atom-message-panel'
 * messages = new MessagePanelView title: 'Coffee Panels'
 * messages.attach()
 * messages.add new LineMessageView line: 1, character: 3, message: 'Look!'
 *
 * See the documentation-block on the individual
 * classes for what options they accept.
 */

var $ = require('atom').$,
    View = require('atom').View;

var inherits = function (child, parent) {
    // Unfortunatly, there seems to be a bug in `View`
    // that prevents it from working with util.inherits
    // from Node.js. So we'll have to do with this
    // version of inherits, because it's what CS uses.
    // See: http://discuss.atom.io/t/-/2536
    for (var key in parent) {
        if ({}.hasOwnProperty.call(parent, key)) child[key] = parent[key];
    }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

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
    View.apply(this);
    this.title = params.title;
    this.rawTitle = params.rawTitle || false;
    this.speed = params.speed || 'fast';
    this.messages = [];
}
inherits(MessagePanelView, View);

MessagePanelView.content = function() {
    this.div({class: 'am-panel tool-panel panel-bottom'}, function() {
        this.div({class: 'panel-heading'}, function() {
            this.div({class: 'heading-title inline-block', outlet: 'heading'});
            this.div({class: 'heading-summary inline-block', outlet: 'summary'});
            this.div({class: 'heading-buttoms inline-block pull-right'}, function() {
                this.div({class: 'heading-fold inline-block icon-fold', style: 'cursor: pointer', outlet: 'btnFold', click: 'toggle'});
                this.div({class: 'heading-close inline-block icon-remove-close', style: 'cursor: pointer;', outlet: 'btnClose', click: 'detach'});
            }.bind(this));
        }.bind(this));
        this.div({class: 'panel-body padded', outlet: 'body', style: 'max-height:170px;overflow-y:scroll;'});
    }.bind(this));
};

MessagePanelView.prototype.attach = function() {
    atom.workspaceView.prependToBottom(this);
}

MessagePanelView.prototype.afterAttach = function() {
    this.setTitle(this.title, this.rawTitle);
    this.summary.hide();
};

MessagePanelView.prototype.setTitle = function(title, raw) {
    if (raw) this.heading.html(title);
    else this.heading.text(title);
};

MessagePanelView.prototype.setSummary = function(summary, className) {
    // Reset the class-attributes on the old summary
    this.summary.attr('class', 'heading-summary inline-block');
    // Set the new summary
    this.summary.text(summary);
    if (className) this.summary.addClass(className);
}

MessagePanelView.prototype.toggle = function() {
    this.btnFold.toggleClass('icon-fold, icon-unfold');
    this.body.toggle(this.speed);
    // Because we want to toggle between display:
    // 'none' and 'inline-block' for the summary,
    // we can't use .toggle().
    if (this.summary.css('display') == 'none')
        this.summary.css('display', 'inline-block');
    else
        this.summary.hide();
};

MessagePanelView.prototype.detach = function() {
    this.remove();
};

MessagePanelView.prototype.clear = function() {
    this.body.empty();
};

MessagePanelView.prototype.add = function(view) {
    if (this.messages.length == 0 && view.getSummary) {
      // This is the first message, so use it to
      // set the summary
      var summary = view.getSummary();
      this.setSummary(summary.summary, summary.className);
    }
    this.messages.push(view);
    this.body.append(view);
};

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
    View.apply(this);
    this.message = params.message;
    this.raw = params.raw || false;
    this.className = params.className || undefined;
}
inherits(PlainMessageView, View);

PlainMessageView.content = function() {
    this.div({class: 'plain-message'});
};

PlainMessageView.prototype.afterAttach = function() {
    if (this.raw) this.html(this.message);
    else this.text(this.message);

    if (this.className)
        this.addClass(this.className);
};

PlainMessageView.prototype.getSummary = function() {
    return {summary: this.message, className: this.className};
};

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


module.exports = {
    MessagePanelView: MessagePanelView,
    PlainMessageView: PlainMessageView,
    LineMessageView: LineMessageView
};
