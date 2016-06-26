var app = require('../'),
    chai = require('chai');

var envValue = '';
var cmdValue = '';

app
    .command('* <cmd> [env]')
    .action(function (cmd, env) {
        cmdValue = cmd;
        envValue = env;
    })
    .option('-C, --chdir [path]', 'change the working directory')
    .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
    .option('-T, --no-tests', 'ignore test hook');

var assert = require('chai').assert;
describe('parseArgs', function () {
    it('options.config should be conf, cmdValue and envValue should be empty', function () {
        app.listen(['node', 'test', '--config', 'conf', '', '']);
        assert.equal('conf', app.options.config);
        assert.equal('', cmdValue);
        assert.equal('', envValue);
    });

    it('cmdValue should be setup and envValue should be env1', function () {
        app.listen(['node', 'test', '--config', 'conf1', 'setup', 'env1']);
        assert.equal('setup', cmdValue);
        assert.equal('env1', envValue);
    });

    it('cmdValue should be empty and envValue should be null', function () {
        app.listen(['node', 'test', '--config', 'conf2', '']);
        assert.equal('conf2', app.options.config);
        assert.equal('', cmdValue);
        assert.equal(null, envValue);
    });
});