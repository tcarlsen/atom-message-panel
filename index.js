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

        $('<button />')
            .addClass('close')
            .css('margin-top', '-5px')
            .html('&times;')
            .click(this.destroy)
            .appendTo($('.panel-heading', panel));

        $('<div />')
            .addClass('panel-body padded')
            .css({
                'max-height': '170px',
                'overflow-y': 'scroll'
            })
            .appendTo(panel);

        atom.workspaceView.prependToBottom(panel);
    },
    clear: function () {
        'use strict';

        $('.am-panel .panel-body').html('');
    },
    destroy: function () {
        'use strict';

        $('.am-panel').remove();
    },
    append: {
        header: function (text, className) {
            'use strict';

            $('<h1 />')
                .addClass(className)
                .html(text)
                .appendTo('.am-panel .panel-body');
        },
        message: function (msg, className) {
            'use strict';

            $('<div />')
                .addClass('block ' + className)
                .html(msg)
                .appendTo('.am-panel .panel-body');
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
