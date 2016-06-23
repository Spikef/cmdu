var app = require('../'),
    mocha = require('mocha'),
    chai = require('chai');

var envValue = '';
var cmdValue = '';

app
    .command('* [cmd] [env]')
    .action(function (cmd, env) {
        cmdValue = cmd;
        envValue = env;
    })
    .option('-C, --chdir [path]', 'change the working directory')
    .option('-c, --config [path]', 'set config path. defaults to ./deploy.conf')
    .option('-T, --no-tests', 'ignore test hook');

var assert = require('chai').assert;
describe('parseArgs', function () {
    it('should parse the arguments as expected', function () {
        app.listen(['node', 'test', '--config', 'conf']);
        assert.equal('conf', app.options.config);
        assert.equal('', cmdValue);
        assert.equal('', envValue);

        app.listen(['node', 'test', 'setup', 'env1', '--config', 'conf1']);
        assert.equal('conf1', app.options.config);
        assert.equal('setup', cmdValue);
        assert.equal('env1', envValue);
    });
});