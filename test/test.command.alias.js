var app = require('../');
var assert = require('chai').assert;

var val = null;

app
    .command('cmd-alias')
    .alias('ca')
    .alias('cb,cc|cd')
    .alias(['ce', 'cf'])
    .action(function () {
        val = true;
    });

describe('alias', function () {
    it('should be true when exec ca, cb, cc, cd, ce, cf', function () {
        val = false;
        app.listen(['node', 'test', 'ca']);
        assert.equal(true, val);

        val = false;
        app.listen(['node', 'test', 'cb']);
        assert.equal(true, val);

        val = false;
        app.listen(['node', 'test', 'cc']);
        assert.equal(true, val);

        val = false;
        app.listen(['node', 'test', 'cd']);
        assert.equal(true, val);

        val = false;
        app.listen(['node', 'test', 'ce']);
        assert.equal(true, val);

        val = false;
        app.listen(['node', 'test', 'cf']);
        assert.equal(true, val);

    });
});