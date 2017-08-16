/**
 * cmdu By Spikef
 * A comfortable way to create your command line app.
 */

var log = require('./lib/log');
var utils = require('./lib/utils');
var Command = require('./lib/command');
var language = require('./language');
var listening = false;  // listen manually

var Cmdu = function() {
    this.log = log;
    this.name = null;
    this.version = null;
    this.commands = {};
    this.allowUnknowns = false;

    this.command();

    Object.defineProperty(this, 'language', {
        set: function(lan) {
            language.setLan(lan);
        }
    });
};

/**
 * define a new command
 * @param {string} [cmd] - such as `init <name>`
 * @param {string} [description] - description
 * @param {Object} [options] - extra arguments
 * @param {string} [options.description] - description
 * @param {boolean} [options.noHelp=false] - ignore this command when show the global help
 * @param {boolean} [options.isBase=false] - not a real command, won't execute, and noHelp=true
 * @param {string[]} [options.mixins] - mixins some existing commands' options
 * @returns {Command}
 */
Cmdu.prototype.command = function(cmd, description, options) {
    var command = new Command(cmd, description, options);
    this.commands[command.name] = command;
    if (command.name !== '*' && !command.__noHelp__ && !command.__isBase__) {
        this.commands['*'].__children__.push(command);
    }

    var that = this;
    Object.defineProperties(command, {
        'commands': {
            enumerable: false,
            configurable: false,
            get: function() {
                return that.commands;
            }
        },
        'allowUnknowns': {
            enumerable: false,
            configurable: false,
            get: function() {
                return that.allowUnknowns;
            }
        }
    });

    return command;
};

/**
 * extends a existing command
 * @param {string} [cmd] - such as `init <name>`
 * @param {string} [description] - description
 * @param {Object} [options] - extra arguments
 * @param {string} [options.description] - description
 * @param {boolean} [options.noHelp=false] - ignore this command when show the global help
 * @param {boolean} [options.isBase=false] - not a real command, won't execute, and noHelp=true
 * @param {string[]} [options.mixins] - mixins some existing commands' options
 * @returns {Command}
 */
Cmdu.prototype.extends = function(cmd, description, options) {
    var command;
    var result = Command.resolve(cmd, description, options);
    if (command = this.commands[result.name]) {
        command._extends(result);
        return command;
    } else {
        return this.command(cmd, description, options);
    }
};

/**
 * get the global source command
 * @returns {string}
 */
Cmdu.prototype.toSource = function() {
    if (!this._source) {
        var args = process.argv.slice(2);
        var name = this.name || utils.basename(process.argv[1]);
        this._source = name + args.join(' ');
    }

    return this._source;
};

/**
 * listen the user input
 * @param {Array} [argv]: process.argv
 */
Cmdu.prototype.listen = function(argv) {
    listening = true;

    argv = argv || process.argv;
    var cmd = argv[2] || '*';
    if (cmd !== '*') {
        cmd = '*';

        for (var i in this.commands) {
            if (!this.commands.hasOwnProperty(i)) continue;
            if (~this.commands[i].aliases.indexOf(argv[2])) {
                if (!this.commands[i].__isBase__) {
                    cmd = this.commands[i].aliases[0];
                }
                break;
            }
        }
    }

    if (argv.length === 3 && (/^-v|--version$/.test(argv[2]))) {
        console.log(this.version);
        process.exit(0);
    } else {
        var args = argv.slice(cmd === '*' ? 2 : 3);
        this.commands[cmd].execute(args);
    }
};

module.exports = new Cmdu();

process.once('exit', function() {
    if (!listening) {
        module.exports.listen();
    }
});