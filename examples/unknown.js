var app = require('../');

app.allowUnknowns = true;

app
    .command('login', '用户登录')
    .option('-u, --username [username]', '用户名')
    .option('-p, --password [password]', '密码')
    .option('--no-keep', '记住密码')
    .action(function(options, result) {
        console.log(options);
        console.log(result)
    });

app.listen();