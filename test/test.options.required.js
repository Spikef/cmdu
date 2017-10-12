var app = require('../');
var assert = require('chai').assert;
var utils = require('../lib/utils');

var throwError = utils.throwError;
var errorMessage = null;
var errorExpected = '  error: missing required option "--cheese"\n  cheese: optionally specify the type of cheese';

app
    .command('cmd-option-required')
    .option('-c, --cheese <type>', 'optionally specify the type of cheese')
    .action(function() {});

describe('required option without value', function () {
    before(function() {
        utils.throwError = function (message) {
            var args = Array.prototype.slice.call(arguments);
            message = formatString.apply(null, args);
            message = message.split('\n').map(function(s) { return '  ' + s }).join('\n');
            errorMessage = message;
        };
    });

    after(function() {
        utils.throwError = throwError;
    });

    it('should throw error message when no --cheese', function () {
        errorMessage = null;
        app.listen(['node', 'test', 'cmd-option-required']);
        assert.equal(errorExpected, errorMessage);

        errorMessage = null;
        app.listen(['node', 'test', 'cmd-option-required', '--cheese']);
        assert.equal(errorExpected, errorMessage);
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