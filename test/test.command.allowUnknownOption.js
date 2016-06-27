var app = require('../'),
    chai = require('chai');

app
    .command('cmd-allow-unknown-options')
    .action(function (options) {});

var assert = require('chai').assert;
describe('allowUnknownOption', function () {
    it('should be undefined when --none', function () {
        app.allowUnknownOption = true;
        app.listen(['node', 'test', 'cmd-allow-unknown-options', '--none']);
        assert.equal(undefined, app.options.none);
        app.allowUnknownOption = false;
    });
});