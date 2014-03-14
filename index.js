/*globals require, module, atom*/

var $ = require('atom').$;

module.exports = {
    init: function (title) {
        'use strict';

        var panel = $('<div class="am-panel tool-panel panel-bottom" />');

        $('<div />')
            .addClass('panel-heading')
            .html(title)
            .appendTo(panel);


        $('<div />')
            .addClass('icon-x pull-right')
            .css({
                'color': '#aaa',
                'cursor': 'pointer'
            })
            .click(this.destroy)
            .appendTo($('.panel-heading', panel));

        $('<div />')
            .addClass('icon-fold pull-right')
            .css({
                'color': '#aaa',
                'margin-right': '8px',
                'cursor': 'pointer'
            })
            .click(['fast'], this.fold)
            .appendTo($('.panel-heading', panel));

        $('<a />')
            .addClass('icon-unfold pull-right')
            .css({
                'color': '#aaa',
                'margin-right': '8px',
                'cursor': 'pointer',
                'display': 'none'
            })
            .click(['fast'], this.unfold)
            .appendTo($('.panel-heading', panel));

        $('<div />')
            .addClass('panel-body padded')
            .css({
                'max-height': '170px',
                'overflow-y': 'scroll'
            })
            .appendTo(panel);

        $('<div />')
            .addClass('icon-dash')
            .css({
                'margin-left': '10px',
                'display': 'none'
            })
            .appendTo($('.panel-heading', panel));

        $('<div />')
            .addClass('panel-fold-body')
            .css({
                'display': 'none'
            })
            .appendTo($('.panel-heading', panel));

        atom.workspaceView.prependToBottom(panel);
    },
    clear: function () {
        'use strict';

        $('.am-panel .panel-body').html('');
        $('.am-panel .panel-fold-body')
            .html('')
            .attr('class', 'panel-fold-body')
            .css('cursor', 'text')
            .unbind();
    },
    destroy: function () {
        'use strict';

        $('.am-panel').remove();
    },
    fold: function (speed) {
        'use strict';

        $('.am-panel .icon-unfold, .am-panel .icon-fold').toggle();
        $('.am-panel .panel-fold-body, .am-panel .icon-dash').css('display', 'inline-block');
        $('.am-panel .panel-body').hide(speed);
    },
    unfold: function (speed) {
        'use strict';

        $('.am-panel .icon-unfold, .am-panel .icon-fold').toggle();
        $('.am-panel .panel-fold-body, .am-panel .icon-dash').hide();
        $('.am-panel .panel-body').show(speed);
    },
    append: {
        header: function (text, className) {
            'use strict';

            $('<h1 />')
                .addClass(className)
                .html(text)
                .appendTo('.am-panel .panel-body');

            $('.am-panel .panel-fold-body')
                .addClass(className)
                .html(text);
        },
        message: function (msg, className) {
            'use strict';

            $('<div />')
                .addClass('block ' + className)
                .html(msg)
                .appendTo('.am-panel .panel-body');

            $('.am-panel .panel-fold-body')
                .addClass(className)
                .html(msg);
        },
        lineMessage: function (line, character, msg, preview, className) {
            'use strict';

            var goToLine = function () {
                atom.workspace.getActiveEditor().cursors[0].setBufferPosition([line - 1, character - 1]);
            };

            preview = preview.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            $('<div />')
                .addClass('text-subtle inline-block')
                .css('cursor', 'pointer')
                .html('at line ' + String(line) + ', character ' + String(character))
                .click(goToLine)
                .appendTo('.am-panel .panel-body');

            $('<div />')
                .addClass('inline-block ' + className)
                .html(msg)
                .appendTo('.am-panel .panel-body');

            $('<pre />')
                .css('cursor', 'pointer')
                .html(preview)
                .click(goToLine)
                .appendTo('.am-panel .panel-body');


            $('.am-panel .panel-fold-body')
                .addClass(className)
                .css('cursor', 'pointer')
                .click(goToLine)
                .html(String(line) + ', ' + String(character) + ' ' + msg);
        },
        lineIndicators: function (lines, className) {
            'use strict';

            var i,
                updateView = function () {
                    $('.line-number').removeClass(className);

                    for (i = 0; i < lines.length; i += 1) {
                        $('.line-number-' + (lines[i] - 1))
                            .addClass(className);
                    }
                };

            atom.workspaceView.on('editor:display-updated', function () {
                updateView();
            });

            updateView();
        }
    }
};
