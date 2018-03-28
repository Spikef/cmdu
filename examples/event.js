var i = 0;
var timer = setInterval(function() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('Doing' + '.'.repeat(i++ % 10));
}, 150);

var stop = function() {
    clearInterval(timer);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('Done!\n');
};

var app = require('../');

app.version = '1.0.0';
app.language = 'zh-CN';
app.allowUnknowns = true;
// app.allowTolerance = true;

app
    .action(function() {
        stop();
    });

app
    .command('do')
    .action(function() {
        console.log('won\'t stop.');
    });

app.listen();
