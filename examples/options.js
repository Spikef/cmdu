var app = require('../');

function range(val) {
    return val.split('-').map(Number);
}

function list(val) {
    return val.split(',');
}

// parse and default value for options
app
    .command()
    .option('-i, --integer <n>', 'An integer argument', parseInt)
    .option('-f, --float <n>', 'A float argument', parseFloat)
    .option('-r, --range <m>-<n>', 'A range', range)
    .option('-l, --list <items1,items2,items3...>', 'A list', list)
    .option('-o, --optional [value]', 'An optional value', 'default value')
    .option('-c, --collection <...collections>', 'A repeatable value', parseInt, [])
    .action(function(options) {
        console.log(' int: %j', options.integer);
        console.log(' float: %j', options.float);
        console.log(' range: from %j to %j', options.range[0], options.range[1]);
        console.log(' list:', options.list);
        console.log(' optional: %j', options.optional);
        console.log(' collection:', options.collection);
    });

app.listen();