var app = require('../');
var assert = require('chai').assert;

var val = false;

app
    .command('cmd-action')
    .option('-C, --color', 'turn on color output')
    .action(function (options) {
        val = options.color;
    });

describe('action', function () {
    it('should be false when no --color', function () {
        app.listen(['node', 'test', 'cmd-action']);
        assert.equal(false, val);
    });

    it('should be true when --color', function () {
        app.listen(['node', 'test', 'cmd-action', '--color']);
        assert.equal(true, val);
    });
});