var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-option-equal')
    .option('-s, --string <str>')
    .action(function (opts) {
        options = opts;
    });

describe('option equal', function () {
    it('should be abc when -p -c', function () {
        app.listen(['node', 'test', 'cmd-option-equal', '--string=abc']);
        assert.equal('abc', options.string);
    });
});