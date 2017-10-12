var app = require('../');
var assert = require('chai').assert;
var sinon = require('sinon');

var sandbox;

app
    .command('cmd-description [arg]')
    .describe('description of this command')
    .describe('arg', 'an argument');

describe('description', function () {
    it('should contain descriptions when showHelp', function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(process.stdout, 'write');

        app.listen(['node', 'test', 'cmd-description', '-h']);
        var output = process.stdout.write.args[0];

        sandbox.restore();

        assert.equal(true, !!~output[0].indexOf('description of this command'));
        assert.equal(true, !!~output[0].indexOf('an argument'));
    });
});