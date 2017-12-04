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
    this.allowTolerance = false;

    this.command();

    var that = this;
    Object.defineProperty(this, 'language', {
        set: function(lan) {
            language.setLan(lan);
            for (var i in that.commands) {
                /* istanbul ignore if */
                if (!that.commands.hasOwnProperty(i)) continue;
                that.commands[i].__help__ = null;
            }
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

    this._command = command;

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
    /* istanbul ignore else  */
    if (!this._source) {
        var args = process.argv.slice(2);
        var name = this.name || utils.basename(process.argv[1]);
        this._source = name + ' ' + args.join(' ');
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
    var cmd = argv[2];
    var name = cmd || '*';
    if (name !== '*') {
        name = '*';

        var cmdList = [], cmdMaps = {};

        for (var i in this.commands) {
            if (!this.commands.hasOwnProperty(i)) continue;

            var command = this.commands[i];
            if (command.name === '*' || command.__isBase__) continue;

            if (~command.aliases.indexOf(cmd)) {
                name = command.name;
                break;
            }

            command.aliases.forEach(function(alias) {
                cmdList.push(alias);
                cmdMaps[alias] = command.name;
            });
        }

        if (name === '*' && this.allowTolerance) {
            var include, exclude, excluded;
            if (exclude = this.allowTolerance.exclude) {
                if (Array.isArray(exclude) && ~exclude.indexOf(cmd)) {
                    excluded = true;
                }
            }

            if (!excluded) {
                if (include = this.allowTolerance.include) {
                    if (typeof include === 'object') {
                        for (var key in include) {
                            if (!include.hasOwnProperty(key)) continue;
                            cmdList.push(key);
                            cmdMaps[key] = include[key];
                        }
                    }
                }

                var abbrev = require('abbrev');
                var maybes = abbrev(cmdList);

                if (maybes[cmd]) {
                    name = cmdMaps[maybes[cmd]];
                }
            }
        }
    }

    if (argv.length === 3 && (/^-v|--version$/.test(argv[2]))) {
        console.log(this.version);
        process.exit(0);
    } else {
        var args = argv.slice(name === '*' ? 2 : 3);
        this.commands[name].execute(args);
    }
};

// alias for command.alias
Cmdu.prototype.alias = function(name) {
    return this._command.alias(name);
};

// alias for command.describe
Cmdu.prototype.describe = function(cmd, description) {
    return this._command.describe(cmd, description);
};

// alias for command.option
Cmdu.prototype.option = function(opt, description, parse, defaultValue) {
    return this._command.option(opt, description, parse, defaultValue);
};

// alias for command.action
Cmdu.prototype.action = function(callback) {
    return this._command.action(callback);
};

// alias for command.showHelp
Cmdu.prototype.showHelp = function() {
    return this._command.showHelp();
};

// alias for command.customHelp
Cmdu.prototype.customHelp = function(callback) {
    return this._command.customHelp(callback);
};

module.exports = new Cmdu();

/* istanbul ignore next */
process.once('exit', function() {
    if (!listening) {
        module.exports.listen();
    }
});