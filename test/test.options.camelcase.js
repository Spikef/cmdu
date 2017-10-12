var app = require('../');
var assert = require('chai').assert;

var options = null;

app
    .command('cmd-option-camel-case')
    .option('-i, --my-int <n>', 'pass an int', parseInt)
    .option('-n, --my-num <n>', 'pass a number', Number)
    .option('-f, --my-fLOAT <n>', 'pass a float', parseFloat)
    .option('-m, --my-very-long-float <n>', 'pass a float', parseFloat)
    .option('-u, --my-URL-count <n>', 'pass a float', parseFloat)
    .action(function (opts) {
        options = opts;
    });

describe('option camel case', function () {
    it('should be camel case when option name contains -', function () {
        app.listen('node test cmd-option-camel-case -i 5.5 -f 5.5 -m 6.5 -u 7.5 -n 15.99'.split(' '));
        assert.equal(5, options.myInt);
        assert.equal(15.99, options.myNum);
        assert.equal(5.5, options.myFLOAT);
        assert.equal(6.5, options.myVeryLongFloat);
        assert.equal(7.5, options.myURLCount);
    });
});