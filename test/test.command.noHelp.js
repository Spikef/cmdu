var app = require('../'),
    chai = require('chai'),
    sinon = require('sinon');

app
    .command('cmd-no-help', {noHelp: true});

var assert = require('chai').assert;
describe('noHelp', function () {
    before(function() {
        this.sinon = sinon.sandbox.create();
        this.sinon.stub(process, 'exit');
        this.sinon.stub(process.stdout, 'write');
    });

    after(function() {
        this.sinon.restore();
    });

    it('should be command help information when showHelp', function () {
        assert.equal(false, !!~app.showHelp().indexOf('cmd-no-help'));
    });
});