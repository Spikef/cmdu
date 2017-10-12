var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-allow-unknowns')
    .action(function (opts) {
        options = opts;
    });

describe('allowUnknowns', function () {
    it('should be undefined when --none', function () {
        app.allowUnknowns = true;
        app.listen(['node', 'test', 'cmd-allow-unknowns', '--none']);
        assert.equal(undefined, options.none);
        app.allowUnknowns = false;
    });
});