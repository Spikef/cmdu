var app = require('../');
var assert = require('chai').assert;
var sinon = require('sinon');

var sandbox;

describe('language', function () {
    before(function() {
        app.language = 'zh-CN';
    });

    after(function() {
        app.language = 'en-US';
    });

    it('should contain [选项] when show help', function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(process.stdout, 'write');

        app.listen(['node', 'test', '-h']);
        var output = process.stdout.write.args[0];

        sandbox.restore();

        assert.equal(true, !!~output[0].indexOf('选项'));
    });
});