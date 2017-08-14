var app = require('../');

// default value for optional arguments
app
    .command('<cmd> [env=Linux]')
    .action(function(cmd, env) {
        console.log(cmd);
        console.log(env);
    });

// default values for optional arrays
app
    .command('install [...files=a.js,b.js,c.js]')
    .action(function(files) {
        console.log(files);
    });

app.listen();