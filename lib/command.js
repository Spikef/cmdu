var path = require('path');
var setStyle = require('./set-style');

var HelpTitles = {
    about: setStyle('About', 'bold', 'underline'),
    usage: setStyle('Usage', 'bold', 'underline'),
    commands: setStyle('Commands', 'bold', 'underline'),
    arguments: setStyle('Arguments', 'bold', 'underline'),
    options: setStyle('Options', 'bold', 'underline')
};

/**
 * define a new command
 * @param {String} cmd: such as `init <name>`
 * @param {String} [description]: description
 * @param {Object} [options]: extra arguments
 */
var Command = function (cmd, description, options) {
    var result = this.parseCommand(cmd);

    this.origin = cmd;
    this.name = result.name;
    this.cmds = [];
    this.subs = result.subs;
    this._subs = result._subs;
    this.description = '';
    this.options = [];
    this._opts = {};
    this.action = null;
    this.optional = true;

    var type = typeof description;
    if (type === 'string') {
        this.description = description;
    } else if (type === 'object') {
        options = description;
    }

    options = options || {};
    this.noHelp = !!options.noHelp;
    if (options.description) {
        this.description = options.description;
    }
};

/**
 * parse the defined command
 * @param {String} cmd
 * @returns {{}}
 */
Command.prototype.parseCommand = function (cmd) {
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
            ellipsis: false
        };

        if (/^</.test(flag)) {
            sub.name = flag.slice(1, -1);
        } else if(/^\[/.test(flag)) {
            sub.name = flag.slice(1, -1);
            sub.optional = true;
        }

        if (sub.name.startsWith('...')) {
            sub.name = sub.name.substr(3);
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
    var that = this;
    var cmd = path.basename(process.argv[1]);
    var message = [];

    if (this.description) {
        message.push('  ' + HelpTitles.about);
        message.push('');
        message.push('    ' + setStyle.italic(this.description));
        message.push('');
    }

    message.push('  ' + HelpTitles.usage);
    message.push('');
    
    if (this.name === '*') {
        if (this.origin !== '*') {
            message.push('    ' + cmd + this.origin.replace('*', '') + ' [options]');
        } else if (this.subs.length) {
            message.push('    ' + cmd + ' [command] [options]');
        } else {
            message.push('    ' + cmd+ ' [options]')
        }
    } else {
        var names = [this.name].concat(this._alias || []);
        var remain = this.origin.replace(this.name, names.join('|'));
        message.push('    ' + cmd + ' ' + remain + ' [options]');
    }

    var maxWidth = this.maximumWidth();

    if (this.subs.length) {
        message.push('');
        message.push('  ' + HelpTitles.arguments);
        message.push('');

        this.subs.forEach(function (sub) {
            message.push('    ' + setStyle.bold(sub.name) + that.padWithSpace(sub.name, maxWidth) + '     ' + sub.description);
        });
    }

    if (this.cmds.length) {
        message.push('');
        message.push('  ' + HelpTitles.commands);
        message.push('');

        this.cmds.forEach(function (cmd) {
            if (cmd.noHelp) return;
            message.push('    ' + setStyle.bold(cmd.name) + that.padWithSpace(cmd.name, maxWidth) + '     ' + cmd.description);
        });
    }

    if (this.options.length) {
        message.push('');
        message.push('  ' + HelpTitles.options);
        message.push('');

        this.options.forEach(function (opt) {
            message.push('    ' + setStyle.bold(opt.origin) + that.padWithSpace(opt.origin, maxWidth) + '     ' + opt.description);
        });
    }
    
    message = '\n' + message.join('\n') + '\n';
    
    if (typeof callback === 'function') message = callback(message);

    console.info(message);
    process.exit(0);
    
    return message;
};

/**
 * calculate the max width for padding
 * @returns {number}
 */
Command.prototype.maximumWidth = function () {
    var max_sub = this.subs.reduce(function(max, command) {
        return Math.max(max, command.name.length);
    }, 0);

    var max_cmd = this.cmds.reduce(function(max, command) {
        return Math.max(max, command.name.length);
    }, 0);

    var max_opt = this.options.reduce(function(max, option) {
        return Math.max(max, option.origin.length);
    }, 0);

    return Math.max(max_cmd, max_sub, max_opt);
};

/**
 * pad the text to specific width with space
 * @param {String} text
 * @param {Number} width
 */
Command.prototype.padWithSpace = function (text, width) {
    var len = width - text.length;
    if (len <=0 ) return '';
    return ' '.repeat(len);
};

/**
 * set terminal text style
 * @param {String} text
 */
Command.prototype.setStyle = setStyle;

module.exports = Command;