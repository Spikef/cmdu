/**
 * 
 * @param {String} opt
 * @param {String} description
 * @param parse
 * @param defaultValue
 */
var Option = function (opt, description, parse, defaultValue) {
    this.define = opt;
    this.isArray = !!(~opt.indexOf('[array]') || ~opt.indexOf('<array>'));
    this.isBoolean = !~opt.indexOf('[') && !~opt.indexOf('<');
    this.optional = !~opt.indexOf('<');
    var flags = opt.split(/[ ,|]+/);
    if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.alias = flags.shift();
    this.flag = flags.shift();
    this.name = this.flag.replace('--', '');
    this.name = Option.camelCase(this.name);
    this.description = description || '';

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

/**
 * camel case the option name
 * @param {String} name
 */
Option.camelCase = function (name) {
    return name.replace(/\-([a-z])/gi, function ($0, $1) {
        return $1.toUpperCase();
    });
};

module.exports = Option;