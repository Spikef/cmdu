var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-option-combine')
    .option('-p, --pepper', 'add pepper')
    .option('-c, --cheese', 'add cheese')
    .action(function (opts) {
        options = opts;
    });

describe('option short', function () {
    it('should be true when -p -c', function () {
        app.listen(['node', 'test', 'cmd-option-combine', '-p', '-c']);
        assert.equal(true, options.pepper);
        assert.equal(true, options.cheese);
    });
});