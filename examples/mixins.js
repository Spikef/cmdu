var app = require('../');

// you can define the base at any time before listen.
// undefined base command would be ignored.
app
    .command('install', { mixins: ['base1', 'base2', 'base3', 'base4'] })
    .action(function(options) {
        console.log(options);
    });

app
    .command('base1')
    .option('-f, --foo', 'enable some foo');

app
    .command('base2')
    .option('-b, --bar', 'enable some bar');

app
    .command('base3')
    .option('-B, --baz', 'enable some baz');

app.listen();