var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-equal')
    .option('-s, --string <str>')
    .action(function (options) {});

var assert = require('chai').assert;
describe('option equal', function () {
    it('should be abc when -p -c', function () {
        app.listen(['node', 'test', 'cmd-option-equal', '--string=abc']);
        assert.equal('abc', app.options.string);
    });
});