var app = require('../');

app
    .command('setup')
    .option('-f, --foo', 'enable some foo')
    .option('-b, --bar', 'enable some bar')
    .action(function(options) {
        console.log(options);
    });

app
    .command('install')
    .option('-f, --foo', 'enable some foo')
    .option('-b, --bar', 'enable some bar')
    .option('-B, --baz', 'enable some baz')
    .action(function(options) {
        console.log(options);
    });

// extends setup
app
    .extends('setup')
    .option('-B, --baz', 'enable some baz');

// extends install
app
    .extends('install')
    .action(function() {
        console.log('Installing...');
    });

app.listen();