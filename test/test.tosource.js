var app = require('../');
var assert = require('chai').assert;

var name = app.name;

describe('toSource', function () {
    after(function() {
        app.name = name;
    });

    it('should be the full command', function () {
        app.name = 'mocha';
        assert.equal(true, /^mocha/.test(app.toSource()));
    });

    it('should be the full command', function () {
        app.name = null;
        app._source = null;
        assert.equal(true, /^_mocha/.test(app.toSource()));
    });
});