var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-optional-given')
    .option('-c, --cheese [type]', 'optionally specify the type of cheese')
    .action(function (options) {});

var assert = require('chai').assert;
describe('optional option with value', function () {
    it('should be feta when --cheese feta', function () {
        app.listen(['node', 'test', 'cmd-option-optional-given',  '--cheese', 'feta']);
        assert.equal('feta', app.options.cheese);
    });
});