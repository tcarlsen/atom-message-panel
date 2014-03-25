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

module.exports = {
    MessagePanelView: require('./lib/MessagePanelView'),
    PlainMessageView: require('./lib/PlainMessageView'),
    LineMessageView: require('./lib/LineMessageView')
};
