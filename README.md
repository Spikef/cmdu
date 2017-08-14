# cmdu

[![Build Status](https://travis-ci.org/Spikef/cmdu.svg?branch=master)](https://travis-ci.org/Spikef/cmdu)
[![Coverage Status](https://coveralls.io/repos/github/Spikef/cmdu/badge.svg)](https://coveralls.io/github/Spikef/cmdu)
[![NPM Version](http://img.shields.io/npm/v/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![NPM Downloads](https://img.shields.io/npm/dm/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![cmdu starter](https://img.shields.io/badge/cmdu-starter-brightgreen.svg)](https://www.npmjs.org/package/cmdu-cli)


A comfortable way to create your command line app with `node.js`.

[点此阅读中文文档](https://github.com/Spikef/cmdu/blob/master/README_CN.md)

## Installation

    $ npm install cmdu

or install a global cli to quickly start

    $ npm install cmdu-cli -g

## version

Set the app version.

```javascript
#!/usr/bin/env node

var app = require('cmdu');
app.version = '0.0.1';

// node index -v
// node index --version
// prints: 0.0.1
```

## Option

Options are defined with the `.option()` method, also serving as documentation for the options. The example below parses args and options from `process.argv`, leaving remaining args as the `app.args` array which were not consumed by options.

```js
#!/usr/bin/env node

var app = require('cmdu');

app.version = '0.0.1';

app
  .describe('An application for pizzas ordering')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]')
  .listen();

console.log('you ordered a pizza with:');
if (app.options.peppers) console.log('  - peppers');
if (app.options.pineapple) console.log('  - pineapple');
if (app.options.bbq) console.log('  - bbq');

var cheese = true === app.options.cheese
  ? 'marble'
  : app.options.cheese || 'no';

console.log('  - %s cheese', cheese);
console.log(app.args);
```

### Option flags

The flags contains three parts: short flag(optional), long flag(required) and option property(optional).

Short flags may be passed as a single arg, for example `-abc` is equivalent to `-a -b -c`.

Long flags will be passed as the option name to the `options` object. Multi-word options such as "--template-engine" are camel-cased, becoming `app.options.templateEngine` etc.

Option property is used to specify this option is `[optional]` or `<required>`. If user forget the required option, it will print an error information. If user didn't pass any value to an optional option, the value would be the default value or null. Specially while you define the property as `[array]` or `<array>`, this option will be an array. If you didn't specify the option property, this option would be regarded as a boolean value.

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

### Option parse and default value

If you give a function as the third argument, the option will be parsed by this function. And the fourth argument will be the default value.

If the third argument is not a function, it will be treated as the default value.

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

## Command

Sub commands are defined with the `.command()` method.

### Command arguments

The command arguments is a string seperated by space. The first part is the sub command's name. The other parts are the sub command's arguments.

```javascript
#!/usr/bin/env node

var app = require('cmdu');
app.command('test');
```

### Specify the argument syntax

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
Angled brackets (e.g. `<cmd>`) indicate required input.
Square brackets (e.g. `[env]`) indicate optional input.

### Variadic arguments

The last argument of a command can be variadic, and only the last argument.  To make an argument variadic you have to prepend `...` to the argument name.  Here is an example:

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

An `Array` is used for the value of a variadic argument.

### The default command

The default command named `'*'` is defined after you required `cmdu`. You can redefine it as you like.

### The `--harmony`

You can enable `--harmony` option in two ways:
* Use `#! /usr/bin/env node --harmony` in the sub-commands scripts. Note some os version don’t support this pattern.
* Use the `--harmony` option when call the command, like `node --harmony examples/pm publish`. The `--harmony` option will be preserved when spawning sub-command process.

### Options argument

Options can be passed with the call to `.command()`. Specifying `true` for `opts.noHelp` will remove this command from the generated help output.

If `opts` is string or specify `opts.description`, this value will be used as description for this command.

## alias

The `.alias()` method is used for adding alias name for current command. You can specify more than one alias name.

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

The `.describe()` method is used for adding description for sub command and arguments. The descriptions will show when `--help` passed.

## action

The `.action()` method uses a callback function or it's file path to handle this command.
 
### callback function

The defined command arguments are passed in, and the last argument is a json object contains all options.

## file path

Mostly like the callback function, you can also use the function module file path as the argument.

```javascript
#!/usr/bin/env node

var app = require('cmdu');

app.version = '0.0.1';

app
  .command('install <name>')
  .action('./install');

app.listen();
```

## Git-style sub-commands

When a command is defined without `action`, this command will be treated as a git-style sub-command. This tells `cmdu` that you're going to use separate executables for sub-commands, much like `git(1)` and other popular tools.
The `cmdu` will try to search the executables in the directory of the entry script (like `./examples/pm`) with the name `app-command`, like `pm-install`, `pm-search`.

If the program is designed to be installed globally, make sure the executables have proper modes, like `755`.

```javascript
// file: ./examples/pm
var app = require('cmdu');

app
  .command('install [name]', 'install one or more packages')
  .command('search [query]', 'search with optional query')
  .command('list', 'list packages installed', {noHelp: true})
  .listen();
```

## listen

Listen the command input and parse arguments.

## Auto Help

The help information is auto-generated based on the descriptions, so the following `--help` info is for free:

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

## Custom Help

You can use the `.customHelp()` method to output custom help message or handle the help message for each command.

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

Yields the following help output when `node script-name.js -h` or `node script-name.js --help` are run:

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

## Show Help

There are two ways to show help information manually.

```javascript
var app = require('cmdu');

app.version = '0.0.1';

app
    .command('help')
    .describe('show help information for this command')
    .option('-s --show', 'show help information or not')
    .action(function(options) {
        this.showHelp();    // show help for current command
    });

if (!process.argv.slice(2).length) {
    app.showHelp();         // show help for default command
}

app.listen();
```

## Multiple language support

You can set the language as you like. You may want to get more info from the `language` directory.

```javascript
// a predefined language name
app.language('zh-CN');     // can be 'zh-CN, en-US'

// or full language object
app.language({});
```

## Demos

More Demos can be found in the [examples](https://github.com/Spikef/cmdu/tree/master/examples) directory. These examples are modified from Commander.

## License

MIT