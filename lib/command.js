var path = require('path');

/**
 * define a new command
 * @param {String} cmd: such as `init <name>`
 * @param {Object} [options]: extra arguments
 */
var Command = function (cmd, options) {
    var result = Command.parseCommand(cmd);

    this.define = cmd;
    this.name = result.name;
    this.cmds = [];
    this.subs = result.subs;
    this._subs = result._subs;
    this.description = '';
    this.options = [];
    this._opts = {};
    this.action = null;
    this.optional = true;

    options = options || {};
    this.noHelp = !!options.noHelp;
    if (typeof options === 'string') {
        this.description = options;
    } else if (options.description) {
        this.description = options.description;
    }
};

/**
 * parse the defined command
 * @param {String} cmd
 * @returns {{}}
 * @private
 */
Command.parseCommand = function (cmd) {
    var result = {};
    var flags = cmd.split(/\s/);
    if (!flags.length) {
        result.name = '*';
    }else{
        result.name = flags.shift();
    }

    var subs = result.subs = [];
    var _subs = result._subs = {};
    flags.forEach(function (flag) {
        var sub = {
            name: '',
            description: '',
            optional: false,
            ellipsis: false,
            default: ''
        };

        if (/^</.test(flag)) {
            sub.name = flag.slice(1, -1);
        }else if(/^\[/.test(flag)) {
            sub.name = flag.slice(1, -1);
            sub.optional = true;
        }

        if (sub.name.endsWith('...')) {
            sub.name = sub.name.slice(0, -3);
            sub.ellipsis = true;
        }

        if (sub.name) subs.push(sub);

        _subs[sub.name] = subs.length - 1;
    });

    return result;
};

/**
 * define an alias name for command
 * @param {String} name
 */
Command.prototype.alias = function (name) {
    this._alias = this._alias || [];
    this._alias.push(name);
};

/**
 * append new option to command
 * @param {Object} option
 */
Command.prototype.addOption = function (option) {
    var index = this._opts[option.flag];
    if (index === undefined) {
        this.options.push(option);
        index = this.options.length -1;
        if (option.flag) this._opts[option.flag] = index;
        if (option.alias) this._opts[option.alias] = index;
    } else {
        if (this.options[index].alias) delete this._opts[this.options[index].alias];
        this.options[index] = option;
        if (option.alias) this._opts[option.alias] = index;
    }
};

/**
 * add help message to this command or sub command
 * @param [cmd]
 * @param message
 */
Command.prototype.addMessage = function (cmd, message) {
    if (message === undefined) {
        this.description = cmd;
    } else {
        var index;
        if ((index = this._subs[cmd]) !== undefined) {
            this.subs[index].description = message;
        }
    }
};

/**
 * display help information for this command
 */
Command.prototype.showHelp = function (callback) {
    var cmd = path.basename(process.argv[1]);
    var message = [];

    if (this.name === '*') {
        if (this.define !== '*') {
            message.push('  Usage: ' + cmd + this.define.replace('*', '') + ' [options]');
        } else if (this.subs.length) {
            message.push('  Usage: ' + cmd + ' [command] [options]');
        } else {
            message.push('  Usage: ' + cmd + ' [options]');
        }
    } else {
        var name = [this.name].concat(this._alias || []);
        var define = this.define.replace(this.name, name.join('|'));
        message.push('  Usage: ' + cmd + ' ' + define + ' [options]');
    }

    if (this.description) {
        message.push('');
        message.push('  ' + this.description);
    }

    var maxWidth = this.maximumWidth();

    if (this.subs.length) {
        message.push('');
        message.push('  Arguments: ');
        message.push('');

        this.subs.forEach(function (sub) {
            message.push('    ' + Command.padWithSpace(sub.name, maxWidth) + '   ' + sub.description);
        });
    }

    if (this.cmds.length) {
        message.push('');
        message.push('  Commands: ');
        message.push('');

        this.cmds.forEach(function (cmd) {
            if (cmd.noHelp) return;
            message.push('    ' + Command.padWithSpace(cmd.name, maxWidth) + '   ' + cmd.description);
        });
    }

    if (this.options.length) {
        message.push('');
        message.push('  Options: ');
        message.push('');

        this.options.forEach(function (opt) {
            message.push('    ' + Command.padWithSpace(opt.define, maxWidth) + '   ' + opt.description);
        });
    }
    
    message = '\n' + message.join('\n') + '\n';
    
    if (typeof callback === 'function') message = callback(message);

    console.info(message);
    process.exit(0);
};

/**
 * calculate the max width for padding
 * @returns {number}
 * @private
 */
Command.prototype.maximumWidth = function () {
    var max_sub = this.subs.reduce(function(max, command) {
        return Math.max(max, command.name.length);
    }, 0);

    var max_cmd = this.cmds.reduce(function(max, command) {
        return Math.max(max, command.name.length);
    }, 0);

    var max_opt = this.options.reduce(function(max, option) {
        return Math.max(max, option.define.length);
    }, 0);

    return Math.max(max_cmd, max_sub, max_opt);
};

/**
 * pad the text to specific width with space
 * @param {String} text
 * @param {Number} width
 * @static
 * @private
 */
Command.padWithSpace = function (text, width) {
    var len = width - text.length;
    if (len <=0 ) return text;
    return text + ' '.repeat(len);
};

module.exports = Command;