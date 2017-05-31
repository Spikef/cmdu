var util = require('util'),
    app = require('../'),
    chai = require('chai'),
    sinon = require('sinon');

var throwError = app.throwError;
var errorMessage = null;
var errorExpected = '  error: missing required option "--cheese"\n  cheese: optionally specify the type of cheese';

app.throwError = function (message) {
    var args = Array.prototype.slice.call(arguments);
    message = formatString.apply(null, args);
    message = message.split('\n').map(function(s) { return '  ' + s }).join('\n');
    errorMessage = message;
};

app
    .command('cmd-option-required')
    .option('-c, --cheese <type>', 'optionally specify the type of cheese')
    .action(function (options) {});

var assert = require('chai').assert;
describe('required option without value', function () {
    it('should throw error message when no --cheese', function () {
        errorMessage = null;
        app.listen(['node', 'test', 'cmd-option-required']);
        assert.equal(errorExpected, errorMessage);

        errorMessage = null;
        app.listen(['node', 'test', 'cmd-option-required', '--cheese']);
        assert.equal(errorExpected, errorMessage);

        app.throwError = throwError;
    });
});

function formatString() {
    if (arguments.length === 1) {
        return String(arguments[0]);
    } else if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        return String(arguments[0]).replace(/{(\d+)}/g, function ($0, $1) {
            return args[$1] || $0;
        })
    } else {
        return '';
    }
}