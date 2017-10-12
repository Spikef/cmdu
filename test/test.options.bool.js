var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-option-boolean')
    .option('-p, --pepper', 'add pepper')
    .option('-c, --cheese', 'add cheese')
    .action(function (opts) {
        options = opts;
    });

describe('optional option without value', function () {
    it('should be true when --pepper', function () {
        app.listen(['node', 'test', 'cmd-option-boolean', '--pepper']);
        assert.equal(true, options.pepper);
    });

    it('should be false when no --cheese', function () {
        app.listen(['node', 'test', 'cmd-option-boolean', '--pepper']);
        assert.equal(false, options.cheese);
    });
});