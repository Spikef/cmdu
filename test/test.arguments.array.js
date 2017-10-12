var app = require('../');
var assert = require('chai').assert;

var args = [];

app
    .command('cmd-variadic <...files>')
    .option('-t, --test', 'a optional test option')
    .action(function (files) {
        args = files;
    });

describe('args list', function () {
    it('should be array when use ... to define a argument', function () {
        app.listen(['node', 'test', 'cmd-variadic', 'file1', 'file2', 'file3', '-t']);
        assert.equal('file1', args[0]);
        assert.equal('file2', args[1]);
        assert.equal('file3', args[2]);
    });
});