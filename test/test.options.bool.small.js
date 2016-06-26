var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-combine')
    .option('-p, --pepper', 'add pepper')
    .option('-c, --cheese', 'add cheese')
    .action(function (options) {});

var assert = require('chai').assert;
describe('option short', function () {
    it('should be true when -p -c', function () {
        app.listen(['node', 'test', 'cmd-option-combine', '-p', '-c']);
        assert.equal(true, app.options.pepper);
        assert.equal(true, app.options.cheese);
    });
});