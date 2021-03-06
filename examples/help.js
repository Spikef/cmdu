var app = require('../');

// custom help
app
    .option('-f, --foo', 'enable some foo')
    .option('-b, --bar', 'enable some bar')
    .option('-B, --baz', 'enable some baz')
    .customHelp(function(help) {
        help = help + '\n\n' + [
            '| [example] |',
            '| $ help --help |',
            '| $ help -h |'
        ].join('\n');

        return help;
    })
    .action(function(options, result) {
        if (!result.argv.length) {
            // show help manually
            this.showHelp();
        } else {
            console.log(options);
        }
    });

app
    .command('help [command]', 'show command\'s help')
    .action(function(command, options, result) {
        if (!result.argv.length) {
            // show help manually
            this.showHelp();
        } else {
            console.log(options);
        }
    })
    .customHelp(function(help) {
        help = help + '\n\n' + [
            '| [example] |',
            '| $ help --help |',
            '| $ help -ww |'
        ].join('\n');

        return help;
    });

app.listen();