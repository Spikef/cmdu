var app = require('../');
var assert = require('chai').assert;
var sinon = require('sinon');

var sandbox;

app
    .command('cmd-help');

describe('showHelp', function () {
    it('should be command help information when showHelp', function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(process.stdout, 'write');

        app.listen(['node', 'test', 'cmd-help', '-h']);
        var output = process.stdout.write.args[0];

        sandbox.restore();

        assert.equal(true, !!~output[0].indexOf('cmd-help'));
    });
});