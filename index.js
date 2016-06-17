/**
 * cmdu By Spikef
 * A comfortable way to create your command line app.
 */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var Command = require('./lib/command');
var Option = require('./lib/option');

var commands = {};
var last_cmd = '*';
var alias_cmd = {};

/**
 * application version, writable
 */
exports.version = require('./package.json').version;

/**
 * if throw error while pushed a unknown argument
 * @type {boolean}
 */
exports.allowUnknownOption = false;

/**
 * the remaining argv
 * @type {Array}
 */
exports.args = [];

/**
 * the passed options
 * @type {{}}
 */
exports.options = {};

/**
 * define a new command
 * @param {String} define: such as `init <name>`
 * @param {Object} [options]: extra arguments
 */
exports.command = function (define, options) {
    var command = new Command(define, options);
    last_cmd = command.name;
    commands[last_cmd] = command;
    if (command.name !== '*') {
        this.option('-h, --help', 'output the help information');
        commands['*'].cmds.push(command);
    } else {
        this.option('-h, --help', 'output the help information');
        this.option('-v, --version', 'output the version number');
    }

    return this;
};

/**
 * define an alias name for command
 * @param name
 */
exports.alias = function (name) {
    commands[last_cmd].alias(name);
    alias_cmd[name] = last_cmd;
    return this;
};

/**
 * add description for command or sub command
 * @param {String} [cmd] - sub command name
 * @param {String} description
 */
exports.describe = function (cmd, description) {
    commands[last_cmd].addMessage(cmd, description);
    return this;
};

/**
 * define a option for the current command
 * @param define
 * @param description
 * @param [parse]
 * @param [defaultValue]
 */
exports.option = function (define, description, parse, defaultValue) {
    var option = new Option(define, description, parse, defaultValue);
    commands[last_cmd].addOption(option);
    return this;
};

/**
 * use a function to handle the command
 * @param callback
 */
exports.action = function (callback) {
    commands[last_cmd].action = callback;
    return this;
};

/**
 * use a CommonJS module to handle the command
 * @param {String} file
 */
exports.use = function (file) {
    commands[last_cmd].action = function() {
        var work;
        if (module.parent && module.parent.filename) {
            work = path.dirname(module.parent.filename);
        }else {
            work = process.cwd();
        }

        var method = require(path.resolve(work, file));
        if (typeof method === 'function') {
            method.apply(method, arguments);
        }
    };
    
    return this;
};

/**
 * listen the user input
 */
exports.listen = function () {
    var argv = process.argv.slice(2);
    var result = this.parseArgs(argv);
    var name = result.name;

    var command = commands[name];
    if (result.help) {
        if (!command.noHelp) {
            if (typeof this.customHelp === 'function') {
                this.customHelp(command);
            } else {
                command.showHelp();
            }
        }
    } else if (result.version) {
        process.stdout.write(exports.version + '\n');
        process.exit(0);
    } else {
        var callback = commands[name].action;
        if (typeof callback === 'function') {
            if (result.unknowns && !this.allowUnknownOption) {
                exports.throwError(2, '  error: unknown option "{0}"', result.unknowns);
            } else {
                callback.apply(callback, result.args);
            }
        } else if (name !== '*') {
            this.execSubCommand();
        }
    }
};

/**
 * parse process arguments
 * @param args
 * @returns {{name: *, [args]: Array.<*>, [help]: boolean, [version]: boolean, [unknowns]: string|boolean}}
 * @private
 */
exports.parseArgs = function (args) {
    var name, flag, value;
    var ret = [], arg, index;
    var subs = [];
    var options = {};
    var command;
    var option;
    var unknowns = false;

    if (!args || !args.length || !commands[args[0]]) {
        if ((name = alias_cmd[args[0]]) === undefined) {
            name = '*';
        } else {
            args.shift();
        }
    }else{
        name = args.shift();
    }

    command = commands[name];

    var alias_help = null, alias_version = null;
    if ((index = command._opts['--help']) !== undefined) {
        alias_help = command.options[index].alias || null;
    }

    if ((index = command._opts['--version']) !== undefined) {
        alias_version = command.options[index].alias || null;
    }

    if (!!(~args.indexOf(alias_help) || ~args.indexOf('--help'))) {
        return { name: name, help: true };
    }

    if (args.length === 1 && (args[0] === alias_version || args[0] === '--version')) {
        return { name: name, version: true };
    }

    command.subs.forEach(function (sub) {
        if (!sub.optional && (args.length === 0 || /^-/.test(args[0]))) {
            var message = '  error: missing required argument "{0}"';
            if (sub.description) message += '\n  {0}: ' + sub.description;
            exports.throwError(0, message, sub.name);
        } else if (sub.optional && args.length === 0) {
            subs.push(sub.default);
        } else if (sub.optional && /^-/.test(args[0])) {
            subs.push(sub.default);
        } else if (sub.ellipsis) {
            var list = [];
            while(args.length && !/^-/.test(args[0])) {
                list.push(args.shift());
            }
            subs.push(list);
        } else {
            subs.push(args.shift());
        }
    });

    for (var i=0, len=args.length; i<len; i++) {
        arg = args[i];

        if (arg === '--') {
            // Honor option terminator
            ret = args.slice(i);
            break;
        } else if (/^-[a-z]+/i.test(arg)) {
            arg.substr(1).split('').forEach(function(alias) {
                alias = '-' + alias;
                if ((index = command._opts[alias]) !== undefined) {
                    option = command.options[index];
                    options[option.name] = null;
                } else if (unknowns) {
                    unknowns = alias;
                }
            });
        } else if (/^--/.test(arg)) {
            if (~(index = arg.indexOf('='))) {
                flag = arg.substring(0, index);
                value = arg.substr(index + 1);
                if ((index = command._opts[flag]) !== undefined) {
                    option = command.options[index];
                    options[option.name] = value;
                } else if (!unknowns) {
                    unknowns = flag;
                }
            } else {
                flag = arg;
                if ((index = command._opts[flag]) !== undefined) {
                    option = command.options[index];
                    options[option.name] = null;
                } else if (!unknowns) {
                    unknowns = flag;
                }
            }
        } else {
            if (option) {
                if (option.isArray) {
                    options[option.name] = options[option.name] || [];
                    options[option.name].push(arg);
                } else {
                    options[option.name] = arg;
                    option = null;
                }
            } else {
                ret.push(arg);
            }
        }
    }
    
    command.options.forEach(function (opt) {
        if (!opt.optional && options[opt.name] === undefined && opt.default === undefined) {
            var message = '  error: missing required option "{0}"';
            if (opt.description) message += '\n  {1}: ' + opt.description;
            exports.throwError(1, message, opt.flag, opt.name);
        }

        if (options[opt.name] === undefined) {
            if (opt.default !== undefined) {
                options[opt.name] = opt.default;
            } else {
                options[opt.name] = false;
            }
        } else if (options[opt.name] === null) {
            if (opt.default !== undefined) {
                options[opt.name] = opt.default;
            } else {
                options[opt.name] = true;
            }
        } else {
            if (opt.parse !== undefined) {
                if (opt.isArray) {
                    options[opt.name] = options[opt.name].map(function (value) {
                        return opt.parse(value);
                    })
                } else {
                    options[opt.name] = opt.parse(options[opt.name]);
                }
            }
        }
    });
    
    this.args = ret;
    for (var o in options) {
        if (!options.hasOwnProperty(o)) continue;
        this.options[o] = options[o];
    }
    
    return {name: name, args: subs.concat([options]), unknowns: unknowns};
};

/**
 * execute a sub command automatically if exists
 * this method is modified from commander.js
 */
exports.execSubCommand = function () {
    var args = process.argv.slice(1);

    // current exec script file
    var file = args.shift();
    // name of the sub command, like `pm-install`
    var bin = path.basename(file, '.js') + '-' + args[0];

    // In case of globally installed, get the base dir where executable sub command file should be located at
    var link = readLink(file);

    // when symbol link is relative path
    if (link !== file && link.charAt(0) !== '/') {
        link = path.join(path.dirname(file), link)
    }

    var base = path.dirname(link);

    // prefer local `./<bin>` to bin in the $PATH
    var localBin = path.join(base, bin);

    // whether bin file is a js script with explicit `.js` extension
    var isExplicitJS = false;
    if (fs.existsSync(localBin + '.js')) {
        bin = localBin + '.js';
        isExplicitJS = true;
    } else if (fs.existsSync(localBin)) {
        bin = localBin;
    }

    args = args.slice(1);

    var proc;
    if (process.platform !== 'win32') {
        if (isExplicitJS) {
            args.unshift(bin);
            // add executable arguments to spawn
            args = (process.execArgv || []).concat(args);

            proc = spawn('node', args, { stdio: 'inherit', customFds: [0, 1, 2] });
        } else {
            proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
        }
    } else {
        args.unshift(bin);
        proc = spawn(process.execPath, args, { stdio: 'inherit'});
    }

    proc.on('close', process.exit.bind(process));
    proc.on('error', function(err) {
        if (err.code == "ENOENT") {
            console.error('\n  %s(1) does not exist, try --help\n', bin);
        } else if (err.code == "EACCES") {
            console.error('\n  %s(1) not executable. try chmod or run with root\n', bin);
        }
        process.exit(1);
    });
};

/**
 * print error message on terminal
 *   type = 0: missing required argument
 *   type = 1: missing required option
 *   type = 2: unknown option
 * @param type: error type
 * @param message
 */
exports.throwError = function (type, message) {
    var args = Array.prototype.slice.call(arguments, 1);
    message = formatString.apply(null, args);
    console.error('\n' + message + '\n');
    process.exit(1);
};

    /**
 * format string with following arguments
 * @returns {String}
 */
function formatString() {
    if (arguments.length === 1) {
        return String(arguments[0]);
    } else if (arguments.length >1) {
        var args = Array.prototype.slice.call(arguments, 1);
        return String(arguments[0]).replace(/\{(\d+)}/g, function ($0, $1) {
            return args[$1] || $0;
        })
    } else {
        return '';
    }
}

/**
 * read the symbolic link
 * this method is modified from graceful-readLink
 * @param {String} path
 * @returns {*}
 */
function readLink(path) {
    if (fs.lstatSync(path).isSymbolicLink()) {
        return fs.readlinkSync(path);
    } else {
        return path;
    }
}

/**
 * define the default command
 */
exports.command('*');

/**
 * define a custom help method
 */
exports.customHelp = null;