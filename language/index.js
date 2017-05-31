var fs = require('fs');
var path = require('path');

var lans = [];
fs.readdirSync(__dirname).forEach(function(name) {
    if (/\.lan\.js$/.test(name)) {
        lans.push(name.replace(/\.lan\.js$/, ''));
    }
});

var language = module.exports = {};

Object.defineProperty(language, 'setLan', {
    get: function() {
        return function(lan) {
            if (typeof lan === 'string') {
                if (!~lans.indexOf(lan)) lan = 'en-US';
                lan = path.resolve(__dirname, lan + '.lan.js');
                lan = require(lan);
            }

            extend(lan, language);
        }
    }
});

language.setLan('en-US');   // set the default language

function extend(source, target) {
    target = target || {};

    for (var i in source) {
        if (!source.hasOwnProperty(i)) continue;

        if (typeof source[i] === 'object') {
            target[i] = extend(source[i]);
        } else {
            target[i] = source[i];
        }
    }

    return target;
}