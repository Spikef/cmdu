var app = require('../'),
    mocha = require('mocha'),
    chai = require('chai');

app
    .command('sub1')
    .action(function (options) {});

var assert = require('chai').assert;
describe('allowUnknownOption', function () {
    it('should be undefined when --none input', function () {
        app.allowUnknownOption = true;
        app.listen(['node', 'test', 'sub1', '--none']);
        assert.equal(undefined, app.options.none);
    });

});