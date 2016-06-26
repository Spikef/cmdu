var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-boolean')
    .option('-p, --pepper', 'add pepper')
    .option('-c, --cheese', 'add cheese')
    .action(function (options) {});

var assert = require('chai').assert;
describe('optional option without value', function () {
    it('should be true when --pepper', function () {
        app.listen(['node', 'test', 'cmd-option-boolean', '--pepper']);
        assert.equal(true, app.options.pepper);
    });
    
    it('should be false when no --cheese', function () {
        app.listen(['node', 'test', 'cmd-option-boolean', '--pepper']);
        assert.equal(false, app.options.cheese);
    });
});