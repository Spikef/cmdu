var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-combine')
    .option('-p, --pepper', 'add pepper')
    .option('-c, --cheese', 'add cheese')
    .action(function (options) {});

var assert = require('chai').assert;
describe('option combine', function () {
    it('should be true when -pc', function () {
        app.listen(['node', 'test', 'cmd-option-combine', '-pc']);
        assert.equal(true, app.options.pepper);
        assert.equal(true, app.options.cheese);
    });
});