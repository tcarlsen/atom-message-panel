"use strict";

function MessageList() {
  this.messages = [];
}

var msgs = MessageList.prototype;

msgs.clear = function () {
  this.messages = [];
};

msgs.setCurrentMessage = function (msg) {
  this.currentMessageIndex = this.messages.indexOf(msg);
};

msgs.nextMessage = function (offset) {
  var n = this.currentMessageIndex, count = this.length;
  if (n === undefined) {
    n = (offset === 1 ? -1 : 0);
  }
  n += offset;
  if (n < 0) {
    n = count - (-n % count);
  } else {
    n = n % count;
  }
  this.currentMessageIndex = n;
  return this.at(n);
};

msgs.at = function (index) {
  return this.messages[index];
};

msgs.indexOf = function (thing) {
  return this.messages.indexOf(thing);
};

msgs.push = function (msg) {
  this.messages.push(msg);
};

msgs.empty = function () {
  return this.messages.length === 0;
};

msgs.getHighlightedMessages = function () {
  return this.messages.filter(function (msg) {
    return msg.isHighlighted && msg.isHighlighted();
  });
};

msgs.findMessagesAt = function (relativeFileURI, point) {
  var pointLine = (point.row + 1);
  return this.messages.filter(function (msg) {
    return msg.line === pointLine && (!msg.file || msg.file === relativeFileURI);
  });
};

Object.defineProperties(msgs, {
  length: {
    get: function () {
      return this.messages.length;
    }
  }
});

module.exports = MessageList;
