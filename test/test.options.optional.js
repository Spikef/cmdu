var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-option-optional')
    .option('-c, --cheese [type]', 'optionally specify the type of cheese')
    .option('-p, --pepper [type]', 'optionally specify the type of pepper')
    .option('-p, --pepper [type]', 'optionally specify the type of pepper', 'black')    // overwrite --pepper
    .action(function (opts) {
        options = opts;
    });

describe('optional option without value', function () {
    it('should be null when --cheese', function () {
        app.listen(['node', 'test', 'cmd-option-optional', '--cheese']);
        assert.equal('', options.cheese);
    });

    it('should be undefined when no --cheese', function () {
        app.listen(['node', 'test', 'cmd-option-optional']);
        assert.equal('', options.cheese);
    });

    it('should be [black] when no --cheese', function () {
        app.listen(['node', 'test', 'cmd-option-optional']);
        assert.equal('black', options.pepper);
    });
});