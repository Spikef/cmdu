var app = require('../'),
    chai = require('chai');

app
    .command('cmd-option-camel-case')
    .option('-i, --my-int <n>', 'pass an int', parseInt)
    .option('-n, --my-num <n>', 'pass a number', Number)
    .option('-f, --my-fLOAT <n>', 'pass a float', parseFloat)
    .option('-m, --my-very-long-float <n>', 'pass a float', parseFloat)
    .option('-u, --my-URL-count <n>', 'pass a float', parseFloat)
    .action(function (options) {});

var assert = require('chai').assert;
describe('option camel case', function () {
    it('should be camel case when option name contains -', function () {
        app.listen('node test cmd-option-camel-case -i 5.5 -f 5.5 -m 6.5 -u 7.5 -n 15.99'.split(' '));
        assert.equal(5, app.options.myInt);
        assert.equal(15.99, app.options.myNum);
        assert.equal(5.5, app.options.myFLOAT);
        assert.equal(6.5, app.options.myVeryLongFloat);
        assert.equal(7.5, app.options.myURLCount);
    });
});