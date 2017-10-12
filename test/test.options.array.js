var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-option-array')
    .option('-a, --int-array <...array>', 'add a int list', parseInt, [])
    .action(function (opts) {
        options = opts;
    });

describe('option array', function () {
    it('should be [1, 2, 3] when option -a 1 2 3', function () {
        app.listen('node test cmd-option-array -a 1 2 3'.split(' '));

        assert.equal(1, options.intArray[0]);
        assert.equal(2, options.intArray[1]);
        assert.equal(3, options.intArray[2]);
    });
});