var app = require('../'),
    mocha = require('mocha'),
    chai = require('chai');

var val = false;
app
    .command('info')
    .option('-C, --color', 'turn on color output')
    .action(function (options) {
        val = options.color;
    });

var assert = require('chai').assert;
describe('action', function () {
    it('should be false when no --color input', function () {
        app.listen(['node', 'test', 'info', '--color']);
        assert.equal(true, val);
        
        app.listen(['node', 'test', 'info']);
        assert.equal(false, val);
    });
});