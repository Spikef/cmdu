var app = require('../'),
    chai = require('chai');

var val = false;
app
    .command('cmd-alias')
    .alias('ca')
    .action(function () {
        val = true;
    });

var assert = require('chai').assert;
describe('alias', function () {
    it('should be true when exec ca', function () {
        app.listen(['node', 'test', 'ca']);
        assert.equal(true, val);
    });
});