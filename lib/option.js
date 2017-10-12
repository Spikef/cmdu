var utils = require('./utils');

/**
 * define a new option
 * @param {string} opt
 * @param {string} [description]
 * @param {function} [parse]
 * @param {*} [defaultValue]
 * @returns {Command}
 */
var Option = function (opt, description, parse, defaultValue) {
    this.opt = opt;
    this.description = description || '';

    this.__parse__ = parse;
    this.__defaultValue__ = defaultValue;
};

Option.prototype._parse = function() {
    var opt = this.opt;
    var parse = this.__parse__;
    var defaultValue = this.__defaultValue__;

    this.isArray = !!(~opt.indexOf('[...') || ~opt.indexOf('<...'));
    this.isBoolean = !~opt.indexOf('[') && !~opt.indexOf('<');
    this.isRequired = defaultValue === undefined && !!~opt.indexOf('<');

    this.aliases = [];
    var flags = opt.split(/[ ,|]+/);
    /* istanbul ignore else  */
    if (flags.length > 1 && !/^[[<]/.test(flags[1])) {
        this.aliases.push(flags.shift());
    }
    var flag = flags.shift();
    if (this.isBoolean) {
        if (/^--no-/.test(flag)) {
            flag = flag.replace(/^--no-/, '--');
            this.default = true;
        } else {
            this.default = false;
        }
    } else if (this.isArray) {
        this.default = [];
    } else {
        this.default = '';
    }
    this.aliases.push(flag);
    this.name = utils.camelCase(flag.replace(/^--/, ''));
    this.id = flag;

    if (parse !== undefined) {
        if (typeof parse === 'function') {
            this.parse = parse;
            if (defaultValue !== undefined) {
                this.default = defaultValue;
            }
        } else {
            this.default = parse;
        }
    }
};

module.exports = Option;