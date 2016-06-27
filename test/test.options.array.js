var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-array')
    .option('-a, --int-array <array>', 'add a int list', parseInt, [])
    .action(function (options) {});

var assert = require('chai').assert;
describe('option array', function () {
    it('should be [1, 2, 3] when option -a 1 2 3', function () {
        app.listen('node test cmd-option-array -a 1 2 3'.split(' '));
        assert.equal(1, app.options.intArray[0]);
        assert.equal(2, app.options.intArray[1]);
        assert.equal(3, app.options.intArray[2]);
    });
});