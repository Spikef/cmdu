var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-optional')
    .option('-c, --cheese [type]', 'optionally specify the type of cheese')
    .action(function (options) {});

var assert = require('chai').assert;
describe('optional option without value', function () {
    it('should be null when --cheese', function () {
        app.listen(['node', 'test', 'cmd-option-optional', '--cheese']);
        assert.equal(null, app.options.cheese);
    });

    it('should be undefined when no --cheese', function () {
        app.listen(['node', 'test', 'cmd-option-optional']);
        assert.equal(undefined, app.options.cheese);
    });
});