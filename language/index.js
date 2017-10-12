var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');

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
                /* istanbul ignore if */
                if (!~lans.indexOf(lan)) lan = 'en-US';
                lan = path.resolve(__dirname, lan + '.lan.js');
                lan = require(lan);
            }

            utils.extend(lan, language);
        }
    }
});

language.setLan('en-US');   // set the default language
