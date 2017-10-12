var app = require('../');
var assert = require('chai').assert;
var sinon = require('sinon');

var sandbox;

app
    .command('cmd-help-custom')
    .customHelp(function(help) {
        help = help + '\n\n' + [
            '| [example] |',
            '| $ help --help |',
            '| $ help -h |'
        ].join('\n');

        return help;
    });

describe('customHelp', function () {
    it('should contain [example] when showHelp', function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(process.stdout, 'write');

        app.listen(['node', 'test', 'cmd-help-custom', '-h']);
        var output = process.stdout.write.args[0];

        sandbox.restore();

        assert.equal(true, !!~output[0].indexOf('example'));
    });
});