var path = require('path');
var language = require('../language');
var Option = require('./option');
var utils = require('./utils');
var log = require('./log');

/**
 * define a new command
 * @param {string} [cmd] - such as `init <name>`
 * @param {string} [description] - description
 * @param {Object} [options] - extra arguments
 * @param {string} [options.description] - description
 * @param {boolean} [options.noHelp=false] - ignore this command when show the global help
 * @param {boolean} [options.isBase=false] - not a real command, won't execute, and noHelp=true
 * @param {string[]} [options.mixins] - mixins some existing commands' options
 */
var Command = function(cmd, description, options) {
    this.__opts__ = {};
    this.__options__ = [];
    this.__args__ = {};
    this.__arguments__ = [];
    this.__children__ = [];
    this.__action__ = null;
    this.__descriptions__ = {};

    var result = resolve(cmd, description, options);

    this.cmd = result.cmd;
    this.name = result.name;
    this.__flags__ = result.flags;
    this.__noHelp__ = result.noHelp;
    this.__isBase__ = result.isBase;
    this.__mixins__ = result.mixins;
    this.description = result.description || '';
    this.aliases = [result.name];
    this.log = log;

    Object.defineProperty(this, 'help', {
        enumerable: true,
        get: function() {
            return this.__help__ || this._buildHelp();
        }
    });
};

/**
 * define an alias name for command
 * @param {string|string[]} name
 * @returns {Command}
 */
Command.prototype.alias = function(name) {
    if (typeof name === 'string') {
        name = name.replace(/^\s+|\s+$/g, '').split(/\s*[,|\s]\s*/);
    }

    this.aliases = this.aliases.concat(name);

    return this;
};

/**
 * add description for command or sub command
 * @param {String} [cmd] - sub command name
 * @param {String} description
 * @returns {Command}
 */
Command.prototype.describe = function(cmd, description) {
    if (description === undefined) {
        this.description = cmd;
    } else {
        this.__descriptions__[cmd] = description;
    }

    return this;
};

/**
 * define a option for the current command
 * @param {string} opt
 * @param {string} [description]
 * @param {function} [parse]
 * @param {*} [defaultValue]
 * @returns {Command}
 */
Command.prototype.option = function(opt, description, parse, defaultValue) {
    var index;
    var option = new Option(opt, description, parse, defaultValue);
    if ((index = this.__opts__[option.opt]) !== undefined) {
        this.__options__[index] = option;
    } else {
        this.__opts__[option.opt] = this.__options__.push(option) - 1;
    }

    return this;
};

/**
 * use a function to handle the command
 * @param {function|string} callback
 */
Command.prototype.action = function(callback) {
    var type = typeof callback;
    if (type !== 'function' && type !== 'string') {
        utils.throwError(language.error.expectFunOrStr);
    }

    this.__action__ = callback;

    return this;
};

/**
 * execute a command
 * @param argv - process.argv.slice(3)
 */
Command.prototype.execute = function(argv) {
    if (!this.__isParsed__) {
        this._mixins();

        if (this.name === '*') {
            this.option('-v, --version', language.help.message.version);
            this.option('-h, --help', language.help.message.help);
        } else {
            this.option('-h, --help', language.help.message.help);
        }

        var that = this;
        this.__opts__ = {};
        this.__options__.forEach(function(option, index) {
            option._parse();
            option.aliases.forEach(function(alias) {
                that.__opts__[alias] = index;
            });
        });

        this._parse();

        this.__isParsed__ = true;
    }

    if (~argv.indexOf('-h') || ~argv.indexOf('--help')) {
        return this.showHelp();
    }

    var callback = this.__action__;
    /* istanbul ignore if */
    if (typeof callback === 'string') {
        callback = search(callback);
    }

    if (typeof callback === 'function') {
        var result = this._parseArgs(argv);
        /* istanbul ignore if */
        if (result.unknowns.length && !this.allowUnknowns) {
            utils.throwError(language.error.unknownInput, result.unknowns[0]);
        } else {
            var args = result.params.concat([
                result.options,
                {
                    argv: result.argv,
                    honors: result.honors,
                    unknowns: result.unknowns
                }
            ]);

            var ret = callback.apply(this, args);
            if (Object.prototype.toString.call(ret) === '[object Promise]') {
                ret.catch(console.error);
            }
        }
    }
};

/**
 * show command help information manually
 */
Command.prototype.showHelp = function() {
    log(this._customHelp || this.help);
    process.exit(0);
};

/**
 * define a custom help information for this command
 * @param callback
 * @returns {Command}
 */
Command.prototype.customHelp = function(callback) {
    /* istanbul ignore if */
    if (typeof callback === 'string') {
        callback = search(callback);
    }

    /* istanbul ignore else */
    if (typeof callback === 'function') {
        var that = this;
        Object.defineProperty(this, '_customHelp', {
            get: function() {
                var help = that.help;
                return callback.call(that, help);
            }
        });
    }

    return this;
};

Command.prototype._parse = function() {
    var that = this;
    var flags = this.__flags__;
    var hadOptional = null;
    flags.forEach(function(flag) {
        var arg = {
            name: '',
            description: '',
            isRequired: true,
            isArray: false
        };

        if (/^</.test(flag)) {
            arg.name = flag.slice(1, -1);
            arg.isRequired = true;

            if (hadOptional) {
                var message = language.error.requiredAfterOptional;
                utils.throwError(message, hadOptional, arg.name);
            }
        } else if(/^\[/.test(flag)) {
            arg.name = flag.slice(1, -1);
            arg.isRequired = false;
            hadOptional = arg.name;
        } else {
            arg.name = flag;
            arg.isRequired = false;
            hadOptional = arg.name;
        }

        if (/^\.\.\./.test(arg.name)) {
            arg.name = arg.name.substr(3);
            arg.isArray = true;
        }

        if (arg.name) {
            var index, value, name = arg.name;
            if (~(index = name.indexOf('='))) {
                arg.name = name.substring(0, index);
                value = name.substr(index + 1);
                if (arg.isArray) {
                    arg.default = value.split(',');
                } else {
                    arg.default = value;
                }
            } else {
                arg.default = arg.isArray ? [] : '';
            }
            arg.description = that.__descriptions__[arg.name] || '';
            that.__args__[arg.name] = that.__arguments__.push(arg) - 1;
        }
    });
};

Command.prototype._parseArgs = function(argv) {
    var that = this;
    var params = [];
    var options = {};
    var option = null;
    var arg, a, v, i = 0, k;
    var rest = [], unknowns = [], honors = [];

    while (i < argv.length) {
        arg = argv[i];

        if (arg === '--') {
            honors = argv.slice(i + 1);
            break;
        } else if (/^-{1,2}[^=]+=/i.test(arg)) {
            k = arg.indexOf('=');
            a = arg.substring(0, k);
            v = arg.substr(k + 1);
            if ((k = that.__opts__[a]) !== undefined) {
                argv.splice(i, 1, a, v);
                continue;
            } else {
                unknowns.push(arg);
            }
        } else if (/^-[a-z]+/i.test(arg)) {
            if ((k = that.__opts__[arg]) !== undefined) {
                option = that.__options__[k];
                argv[i] = option.id;
                continue;
            } else {
                unknowns.push(arg);
            }
        } else if (/^--no-/.test(arg)) {
            a = arg.replace(/^--no-/, '--');
            if ((k = that.__opts__[a]) !== undefined) {
                option = that.__options__[k];
                argv[i] = option.id + '=false';
                continue;
            } else {
                unknowns.push(arg);
            }
        } else if (/^--/.test(arg)) {
            option = null;
            if ((k = that.__opts__[arg]) !== undefined) {
                option = that.__options__[k];
                if (option.isBoolean) options[option.name] = true;
            } else {
                unknowns.push(arg);
            }
        } else {
            if (option) {
                if (option.isArray) {
                    options[option.name] = options[option.name] || [];
                    options[option.name].push(arg);
                } else if (option.isBoolean) {
                    if (arg === 'true' || arg === 'false') {
                        options[option.name] = arg === 'true';
                    } else {
                        options[option.name] = true;
                        rest.push(arg);
                        option = null;
                    }
                } else {
                    options[option.name] = arg;
                    option = null;
                }
            } else {
                rest.push(arg);
            }
        }

        i++;
    }

    this.__options__.forEach(function(opt) {
        if (/^version|help$/.test(opt.name)) return;

        if (opt.isRequired && (options[opt.name] == null)) {
            var message = language.error.requiredOption;
            if (opt.description) message += '\n{1}: ' + opt.description;
            utils.throwError(message, opt.id, opt.name);
        }

        if (options[opt.name] == null) {
            options[opt.name] = opt.default;
        } else {
            if (opt.parse !== undefined) {
                if (opt.isArray) {
                    options[opt.name] = options[opt.name].map(function(value) {
                        return opt.parse(value);
                    });
                } else {
                    options[opt.name] = opt.parse(options[opt.name]);
                }
            }
        }
    });

    this.__arguments__.forEach(function(arg) {
        if (arg.isRequired && !rest.length) {
            var message = language.error.requiredArgument;
            if (arg.description) message += '\n{0}: ' + arg.description;
            utils.throwError(message, arg.name);
        }

        if (!rest.length) {
            params.push(arg.default);
        } else if (arg.isArray) {
            var list = [];
            while (rest.length) {
                list.push(rest.shift());
            }
            params.push(list);
        } else {
            params.push(rest.shift());
        }
    });

    unknowns = unknowns.concat(rest);

    return {
        argv: argv,
        honors: honors,
        params: params,
        options: options,
        unknowns: unknowns
    }
};

Command.prototype._buildHelp = function() {
    var help = [];
    var lans = language.help;
    var cmd = utils.basename(process.argv[1]);

    if (this.description) {
        help.push('| [' + lans.title.about + '] |');
        help.push('| ' + this.description + ' |');
    }

    help.push('| [' + lans.title.usage + '] |');

    if (this.name === '*') {
        if (this.__arguments__.length) {
            help.push('| ' + cmd + ' [' + lans.message.arguments + '] [' + lans.message.options + '] |');
        } else {
            help.push('| ' + cmd + ' [' + lans.message.options + '] |')
        }
    } else {
        var aliases = this.aliases.join('<yellow>|</yellow>');
        var remains = this.__flags__.map(utils.getArgName).join(' ');
        help.push('| ' + cmd + ' ' + aliases + ' ' + remains + ' [' + lans.message.options + '] |');
    }

    help.push('');

    if (this.__arguments__.length) {
        help.push('| [' + lans.title.arguments + '] |');

        this.__arguments__.forEach(function(arg) {
            help.push('| ' + arg.name + ' | ' + arg.description + ' |');
        });
    }

    if (this.__options__.length) {
        help.push('| [' + lans.title.options + '] |');

        this.__options__.forEach(function(opt) {
            help.push('| ' + opt.opt + ' | ' + opt.description + ' |');
        });
    }

    if (this.__children__.length) {
        help.push('| [' + lans.title.commands + '] |');

        this.__children__.forEach(function(cmd) {
            help.push('| ' + cmd.name + ' | ' + cmd.description + ' |');
        });
    }

    help = help.join('\n');
    this.__help__ = help;
    return this.__help__;
};

Command.prototype._mixins = function() {
    if (this.__mixins__ && Array.isArray(this.__mixins__)) {
        var command, index, that = this, options = [], opts = {};
        this.__mixins__.forEach(function(name) {
            if (name && name !== that.name && (command = that.commands[name])) {
                command._mixins();

                command.__options__.forEach(function(option) {
                    if (!that.__opts__[option.opt]) {
                        if ((index = opts[option.opt]) !== undefined) {
                            options[index] = option;
                        } else {
                            opts[option.opt] = options.push(option) - 1;
                        }
                    }
                });
            }
        });
        this.__options__ = options.concat(that.__options__);
    }
};

Command.prototype._extends = function(options) {
    if (!options) return;

    if (options.description != null) {
        this.description = options.description;
    }
    if (options.noHelp != null) {
        this.__noHelp__ = options.noHelp;
    }
    if (options.isBase != null) {
        this.__isBase__ = options.isBase;
    }
    if (options.mixins != null) {
        this.__mixins__ = options.mixins;
    }
    if (options.flags && options.flags.length) {
        this.cmd = options.cmd;
        this.__flags__ = options.flags;
    }
};

function search(filename) {
    var work;

    if (module.parent && module.parent.parent && module.parent.parent.filename) {
        work = path.dirname(module.parent.parent.filename);
    } else {
        work = process.cwd();
    }

    return require(path.resolve(work, filename));
}

function resolve(cmd, description, options) {
    var type = typeof description;
    if (type === 'object') {
        options = description;
        description = options.description;
    }
    cmd = cmd || '';
    options = options || {};

    var result = {};

    if (!cmd) {
        cmd = '*';
    } else if (!/^[\w*]/.test(cmd)) {
        cmd = '* ' + cmd;
    }

    result.description = description;
    result.noHelp = options.noHelp;
    result.isBase = options.isBase;
    result.mixins = options.mixins;
    result.cmd = cmd;

    var index, value, isArg, flags = [];
    while (cmd) {
        if (/^(\s+)/.test(cmd)) {
            cmd = cmd.substring(RegExp.$1.length);
        } else if (/^[\[<]/.test(cmd)) {
            index = cmd.search(/[\]>]/);
            value = cmd.substring(0, index + 1);
            cmd = cmd.substring(value.length);
            flags.push(value);
        } else {
            index = cmd.search(/(\s+|$)/);
            value = cmd.substring(0, index);
            cmd = cmd.substring(index);
            if (isArg) {
                flags.push(value);
            } else {
                result.name = value;
                isArg = true;
            }
        }
    }

    result.flags = flags;

    return result;
}

Command.search = search;
Command.resolve = resolve;

module.exports = Command;
