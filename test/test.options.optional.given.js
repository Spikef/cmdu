var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-option-optional-given')
    .option('-c, --cheese [type]', 'optionally specify the type of cheese')
    .action(function (opts) {
        options = opts;
    });

describe('optional option with value', function () {
    it('should be feta when --cheese feta', function () {
        app.listen(['node', 'test', 'cmd-option-optional-given',  '--cheese', 'feta']);
        assert.equal('feta', options.cheese);
    });
});