var path = require('path');

/**
 * camel case the option name
 * @param {String} name
 */
exports.camelCase = function(name) {
    return name.replace(/-([a-z])/gi, function ($0, $1) {
        return $1.toUpperCase();
    });
};

/**
 * extend target object from source
 * @param source
 * @param target
 * @returns {*|{}}
 */
exports.extend = function extend(source, target) {
    target = target || {};

    for (var i in source) {
        /* istanbul ignore if  */
        if (!source.hasOwnProperty(i)) continue;

        if (source[i] && typeof source[i] === 'object') {
            target[i] = extend(source[i]);
        } else {
            target[i] = source[i];
        }
    }

    return target;
};

/**
 * format string with following arguments
 * @returns {String}
 */
/* istanbul ignore next */
exports.formatString = function formatString() {
    if (arguments.length === 1) {
        return String(arguments[0]);
    } else if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        return String(arguments[0]).replace(/{(\d+)}/g, function ($0, $1) {
            return args[$1] || $0;
        })
    } else {
        return '';
    }
};

/**
 * throw error message
 * @param message
 */
/* istanbul ignore next */
exports.throwError = function throwError(message) {
    var args = Array.prototype.slice.call(arguments);
    message = this.formatString.apply(null, args);
    message = '  ' + message.replace(/\n/g, '\n  ');
    console.error('\n' + message + '\n');
    process.exit(1);
};

/**
 * get basename without extension
 * @param {string} p
 * @returns {string}
 */
exports.basename = function(p) {
    var name = String(p);
    name = path.basename(name);
    name = name.replace(/\..*/, '');
    return name;
};

/**
 * get a argument's name from flags
 * @param {string} arg
 * @returns {string}
 */
/* istanbul ignore next */
exports.getArgName = function(arg) {
    var name = String(arg);
    name = name.replace(/(^[\[<]?)\.\.\./g, '$1');
    name = name.replace(/=[^\]>]*(?=[\]>]?$)/, '');
    return name;
};