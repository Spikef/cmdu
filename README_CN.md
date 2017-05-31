# cmdu

[![Build Status](https://travis-ci.org/Spikef/cmdu.svg?branch=master)](https://travis-ci.org/Spikef/cmdu)
[![Coverage Status](https://coveralls.io/repos/github/Spikef/cmdu/badge.svg)](https://coveralls.io/github/Spikef/cmdu)
[![NPM Version](http://img.shields.io/npm/v/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![NPM Downloads](https://img.shields.io/npm/dm/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![cmdu starter](https://img.shields.io/badge/cmdu-starter-brightgreen.svg)](https://www.npmjs.org/package/cmdu-cli)

让我们一起愉快地写`node.js`命令行工具吧!

## 安装

    $ npm install cmdu

或安装一个全局的cli工具以快速开始

    $ npm install cmdu-cli -g

## 版本号

设置命令行应用的版本号。

```javascript
#!/usr/bin/env node

var app = require('cmdu');
app.version = '0.0.1';

// node index -v
// node index --version
// prints: 0.0.1
```

## 定义选项

命令行选项使用`.option()`方法定义，该方法同时为该选项提供帮助文档。下面的示例演示了如何解析命令行选项，剩余的未定义参数将统统丢到`app.args`数组对象。

```js
#!/usr/bin/env node

var app = require('cmdu');

app.version = '0.0.1';

app
  .describe('命令行点餐系统')
  .option('-m, --meat', '辣椒炒肉')
  .option('-f, --fish', '双椒鱼头')
  .option('-e, --eggplant', '茄子豆角')
  .option('-d, --drink [type]', '选择饮料 [冰镇绿豆汤]')
  .listen();

console.log('你点的套餐包含:');
if (app.options.meat) console.log('  - 辣椒炒肉');
if (app.options.fish) console.log('  - 双椒鱼头');
if (app.options.eggplant) console.log('  - 茄子豆角');

var drink = true === app.options.drink
  ? '冰镇绿豆汤'
  : app.options.drink || '不要饮料';

console.log('  - %s', drink);
console.log(app.args);
```

### 选项标识

选项标识包含三部分：短标识(可选)，长标识(必需)和选项属性(可选)。

多个短选项可以合并输入，例如输入`-abc`等同于`-a -b -c`。

长标识则作为`options`对象中的选项名称。如果选项名称包含多个单词并使用`-`连接(如"--template-engine")，那么将对其进行驼峰转换为`app.options.templateEngine`。

选项属性用于指定该选项是`[可选的]`还是`<必需的>`。如果定义了一个必需输入的参数而用户忘记给定值，则将在命令行输出错误提示。如果定义了一个可选的参数而用户未给定值，则使用参数默认值，如果连默认值也没有给定，则返回null值。有一个特殊用法是使用`[array]`或`<array>`来指定选项属性，这时候这个属性将跟在该标识后的所有值放入一个数组之中。如果未指定选项属性，则该选项将当成布尔值来处理。

```javascript
#!/usr/bin/env node

var app = require('cmdu');

app.version = '0.0.1';

app
  .option('-d, --drink <array>', 'Which drinks would you like')
  .listen();

console.log(app.options);

// node index -d coke coffee tea water
// prints:
// {
//     drink: ['coke', 'coffee', 'tea', 'water']
// }
```

### 参数值转换和默认参数值

如果在定义参数时，将一个函数作为第三个参数传入，那么该参数的值将使用该函数进行转换。同时第四个参数将作为参数的默认值。

如果第三个参数既不是函数也不是undefined，则它将被当作默认值。

```js
#!/usr/bin/env node

var app = require('cmdu');

function range(val) {
  return val.split('..').map(Number);
}

function list(val) {
  return val.split(',');
}

app.version = '0.0.1';

app
  .option('-i, --integer <n>', 'An integer argument', parseInt)
  .option('-f, --float <n>', 'A float argument', parseFloat)
  .option('-r, --range <a>..<b>', 'A range', range)
  .option('-l, --list <items>', 'A list', list)
  .option('-o, --optional [value]', 'An optional value', 'default value')
  .option('-c, --collect <array>', 'A repeatable value', [])
  .listen();

console.log(' int: %j', app.options.integer);
console.log(' float: %j', app.options.float);
console.log(' optional: %j', app.options.optional);
app.options.range = app.options.range || [];
console.log(' range: %j..%j', app.options.range[0], app.options.range[1]);
console.log(' list: %j', app.options.list);
console.log(' collect: %j', app.options.collect);
console.log(' args: %j', app.args);
```

## 定义命令

使用`.command()`方法可以定义一个子命令。

### 命令参数

命令参数是一个字符串，用空格分隔。第一部分为命令名称，剩余部分将作为该命令的参数传入。

```javascript
#!/usr/bin/env node

var app = require('cmdu');
app.command('test');
```

### 指定参数的语法

```js
#!/usr/bin/env node

var app = require('../');

app.version = '0.0.1';

app
    .command('* <cmd> [env]')
    .describe('A demo for redefine the default command')
    .describe('cmd', 'Can be init, install, uninstall, publish')
    .option('-h, --help', 'output the help information')
    .option('-v, --version', 'output the version number')
    .action(function (cmd, env, options) {
        console.log(cmd);
        console.log(env);

        if (options.version) console.log(app.version);
    });

app.listen();
```
尖括号(如`<cmd>`)表示必需输入。
方括号(如`[env]`)表示可选输入。

### 可变参数

命令的最后一个参数可以是可变参数，并且只能是最后一个参数。为了实现这一点，你需要在参数名前面添加`...`。 下面是个示例：

```js
#!/usr/bin/env node

var app = require('cmdu');

app.version = '0.0.1';

app
  .command('rmdir <dir> [...otherDirs]')
  .action(function (dir, otherDirs) {
    console.log('rmdir %s', dir);
    if (otherDirs) {
      otherDirs.forEach(function (oDir) {
        console.log('rmdir %s', oDir);
      });
    }
  });

app.listen();
```

可变参数的值将存入一个数组中。

### 默认命令

当你 require 了`cmdu`模块之后，默认命令将被立即定义。默认命令的名称为`'*'`，所以你可以重定义默认命令的行为。

### `--harmony`选项

有两种方式可以开启`--harmoney`选项：
* 将代码的第一行写成`#!/usr/bin/env node --harmony`。注意这种方式在某些操作系统中可能不被支持。
* 在调用命令时显式输入`--harmoney`，如：`node --harmony examples/pm publish`。

### 定义命令时的options参数

当使用`.command()`方法定义一个命令时，可以在第二个参数传入一个options对象(注意不同于Option对象)。例如：如果指定`opts.noHelp`的值为`true`，那么在自动输出命令帮助时将跳过该命令。

如果`opts`是字符串，或者指定`opts.description`的值为字符串，那么这个值将作为该命令的帮助描述。

## 别名

使用`.alias()`方法可以为当前命令添加一个或多个别名。

```javascript
#!/usr/bin/env node

var app = require('cmdu');

app.version = '0.0.1';

app
    .command('install [name]')
    .describe('install a module')
    .describe('name', 'the module name')
    .alias('ins')
    .alias('i')
    .action(function(name, options) {
        if (name) {
            // install the specify module
        }else{
            // install according to package.json
        }
    });

app.listen();
```

## describe

使用`.describe()`方法可以为当前命令及其参数添加帮助描述。

## action

对`.action()`方法传入一个回调函数或回调函数模块的路径，用于响应用户输入该命令时的操作。

### 回调函数

定义的命令参数将依次作为回调函数的参数传入，回调函数的最后一个参数是一个json对象，保存了所有该命令的选项。

### 模块路径

跟回调函数类似，只是将函数作为一个模块单独存放在一个文件中，同时传入文件路径作为参数。

```javascript
#!/usr/bin/env node

var app = require('cmdu');

app.version = '0.0.1';

app
  .command('install <name>')
  .action('./install');

app.listen();
```

## Git风格子命令

当定义的子命令没有`action`来响应操作时，那么这个命令就将当作Git风格子命令。意味着你将使用单独的可执行文件来响应该命令的操作，就像`git(1)`和其他流行的命令行工具一样。

`cmdu`将尝试在入口模块(例如`./examples/pm`)的目录中搜索包含命令前缀的可执行脚本文件，如`pm-install`，`pm-search`等。

如果该命令被设计为需要全局安装，那么需要确认可执行脚本文件具有相应的权限，如`755`。

```javascript
// file: ./examples/pm
var app = require('cmdu');

app
  .command('install [name]', 'install one or more packages')
  .command('search [query]', 'search with optional query')
  .command('list', 'list packages installed', {noHelp: true})
  .listen();
```

## 监听用户输入

使用`.listen()`方法监听用户输入，该方法将自动解析用户输入，并响应命令对应的方法。

## 自动帮助信息

定义命令和命令选项时加入的帮助描述信息，将自动组织成命令帮助。这样当用户在命令后面输入`-h`或者`---help`时，将自动显示帮助内容。

```
 $ ./examples/pizza --help

  Usage: pizza [options]

  An application for pizzas ordering

  Options:

    -h, --help            output the help information
    -v, --version         output the version number
    -p, --peppers         Add peppers
    -P, --pineapple       Add pineapple
    -b, --bbq             Add bbq sauce
    -c, --cheese [type]   Add the specified type of cheese [marble]


```

## 自定义帮助信息

你可以使用`.customHelp()`方法来自定义帮助信息，该方法既可以针对所有命令来定义，也可以针对单个命令来定义，还可以对自动生成的帮助信息进行操作。

```js
#!/usr/bin/env node

var app = require('../');

app.version = '0.0.1';

app
  .option('-f, --foo', 'enable some foo')
  .option('-b, --bar', 'enable some bar')
  .option('-B, --baz', 'enable some baz');

// must be before .listen() since the help is immediate

app.customHelp = function () {
    var example;
    example = this.language.help.title.example;
    example = this.setStyle(example, 'bold', 'underline');

    this.showHelp(function (message) {
        message = [message].concat([
            '  ' + example,
            '',
            '    $ custom-help --help',
            '    $ custom-help -h',
            ''
        ]).join('\n');

        return message;
    });
};

app.listen();
```

当运行`node script-name.js -h`或`node script-name.js --help`时，将显示如下帮助信息：

```

Usage: custom-help [options]

Options:

  -h, --help     output usage information
  -V, --version  output the version number
  -f, --foo      enable some foo
  -b, --bar      enable some bar
  -B, --baz      enable some baz

Examples:

  $ custom-help --help
  $ custom-help -h

```

## 显示帮助信息

有两种方式可以手动显示帮助信息。

```javascript
var app = require('cmdu');

app.version = '0.0.1';

app
    .command('help')
    .describe('show help information for this command')
    .option('-s --show', 'show help information or not')
    .action(function(options) {
        this.showHelp();    // 显示当前命令的帮助信息
    });

if (!process.argv.slice(2).length) {
    app.showHelp();         // 显示默认命令的帮助信息
}

app.listen();
```

## 多语言支持

你可以自定义语言, 预定义语言可以在`language`目录中找到。

```javascript
// 使用预定义的语言名称
app.language('zh-CN');     // 可以为 'zh-CN, en-US'

// 或者一个完整的语言对象
app.language({});
```

## 示例

你可以在[examples](https://github.com/Spikef/cmdu/tree/master/examples)目录中找到更多示例。这些示例都是修改自Commander模块的示例。

## License

MIT