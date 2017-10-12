var app = require('../');
var assert = require('chai').assert;
var sinon = require('sinon');

var sandbox;

app
    .command('cmd-no-help', { noHelp: true });

describe('noHelp', function () {
    it('should not show [cmd-no-help] when showHelp', function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(process, 'exit');
        sandbox.stub(process.stdout, 'write');

        app.listen(['node', 'test', '-h']);
        var output = process.stdout.write.args[0];

        sandbox.restore();

        assert.equal(true, !~output[0].indexOf('cmd-no-help'));
    });
});