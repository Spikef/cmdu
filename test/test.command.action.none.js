var app = require('../');
var assert = require('chai').assert;
var utils = require('../lib/utils');

var throwError = utils.throwError;
var errorMessage = null;
var errorExpected = '  error: expect a function/file for the action';

utils.throwError = function (message) {
    var args = Array.prototype.slice.call(arguments);
    message = formatString.apply(null, args);
    message = message.split('\n').map(function(s) { return '  ' + s }).join('\n');
    errorMessage = message;
};

app
    .command('cmd-action-none')
    .action(null);

utils.throwError = throwError;

describe('none action', function () {
    it('should throw error message', function () {
        app.listen(['node', 'test', 'cmd-action-none']);
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