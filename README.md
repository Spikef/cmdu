# cmdu

[![Build Status](https://travis-ci.org/Spikef/cmdu.svg?branch=master)](https://travis-ci.org/Spikef/cmdu)
[![Coverage Status](https://coveralls.io/repos/github/Spikef/cmdu/badge.svg?branch=master)](https://coveralls.io/github/Spikef/cmdu?branch=master)
[![NPM Version](http://img.shields.io/npm/v/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![NPM Downloads](https://img.shields.io/npm/dm/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![cmdu starter](https://img.shields.io/badge/cmdu-starter-brightgreen.svg)](https://www.npmjs.org/package/cmdu-cli)

A comfortable way to create your command line app with `node.js`.

[点此阅读中文文档](/README_CN.md)

## Install

```bash
$ npm install cmdu
```

or install a global cli to quickly start

```bash
$ npm install cmdu-cli -g
```

## Usage

```javascript
#!/usr/bin/env node

var app = require('cmdu');

// do something as you like

app.listen();   // listen the user input at last
```

## App properties

### app.name

The `app.name` is only used by the `app.toSource()` method.

### app.version

Set the app version.

```javascript
#!/usr/bin/env node

var app = require('cmdu');
app.version = '0.0.1';

// node index -v
// node index --version
// prints: 0.0.1
```

### app.allowUnknowns

By default, the app would throw an error when user typed an undefined argument or option. You can set `app.allowUnknowns = true` to allow this.

### app.allowTolerance

By default, the user must input the command exactly to execute, but you can set `app.allowTolerance = true` to allow a similarity.

### app.language

You can set the `app.language` to support multiple languages. You may want to get more info from the `language` directory.

```javascript
// a predefined language name
app.language = 'zh-CN';     // can be 'zh-CN, en-US'

// or full language object
app.language = {};
```

## App methods

### app.toSource()

Return the full input for current command.

### app.listen()

Listen the user input and parse the process.argv, and execute the relative command.

This is not always required, you can ignore it if you have no asynchronous action, the `listen` will be run automatically when process exit if you didn't `listen`.

### app.command()

Define a new command and return a `Command` object, view [Command](#Command) for details.

### app.extends()

Extends a existing command, or create a new one if not exists.

### app.log()

Use the `render` method of [cubb](https://github.com/Spikef/cubb) to print strings to terminal.

## Command

A command includes the definition(cmd), name(name), description(description), configs, [arguments](#Command arguments) and [options](#Command options).

The full syntax for defining a new command:

```javascript
app.command(cmd, description, options);
```

**cmd**

The `cmd` is a string with several parts separated by space. The first part is the command name, and the rest parts are command's arguments. That means the [default command](#Default command) if you omit the first part.

**description**

The `description` of a command is useful for building help information automatically. Also you can use `options.description` to specify it.

**configs**

The `configs` is used to define some extra configs for the command.

+ configs.noHelp: Boolean, `true` for removing this command from the auto generated help output.
+ configs.isBase: Boolean, `true` means the command is only a definition as a mixin but not a real one
+ configs.mixins: Array of some command's name, the command would extend their options automatically

Example:

```js
#!/usr/bin/env node

var app = require('cmdu');

app
    .command('<cmd> [env=Linux]')
    .describe('A demo for redefine the default command')
    .describe('cmd', 'Can be init, install, uninstall, publish')
    .action(function (cmd, env, options) {
        console.log(cmd);
        console.log(env);
    });
    
app
    .command('install [name]')
    .describe('install a module')
    .describe('name', 'the module name')
    .alias('ins, i')
    .action(function(name, options) {
        if (name) {
            // install the specify module
        } else {
            // install according to package.json
        }
    });
    
app
    .command('rmdir <dir> [...otherDirs]')
    .action(function (dir, otherDirs) {
        console.log('rmdir %s', dir);
        otherDirs.forEach(function (oDir) {
            console.log('rmdir %s', oDir);
        });
    });

app.listen();
```

### Command arguments

A argument includes the name(name), description(description), required or not, type and default value.

#### Optional or required

The argument value is required by default. And you can also declare it as `[optional]` or `<required>` explicitly. It would throw an error if users forgot to give the required argument a value unless `app.allowUnknowns = true`.

Note: `[optional]` arguments should be defined after `<required>` ones.

#### Type of arguments

Argument value can be string or array. Just prepend '...' to the argument name to declare it as an array type.

Note: only the last argument can be declared as array.

#### Default value of arguments

You can specify a default value according to append the `=defaultValue` to the argument name.

If you didn't specify a default value, it should be:

+ for string type, a empty string
+ for array type, a empty array

#### Passing values to arguments

When passing values, the input order of arguments and options are not limited.

**String**

One by one according to the order of definitions.

**Array**

Values are separated by space.

### Command options

You can use `.option()` to add an option to the current command.

A option includes the definition(opt), name(name), description(description), required or not, type, parse function and default value.

The full syntax for defining a option:

```javascript
command.option(flags, description, parseFn, defaultValue);
```

**flags**

The `flags` contains three parts: short flag(optional), long flag(required) and option attribute(optional).

The option's name will be the same as the long flag without `--` or `--no-`. Multiple words connected with `-` such as "--template-engine" will be camel cased, becoming to `app.options.templateEngine`.

Option attribute is used to specify that this option is `[optional]` or `<required>`.

**description**

The `description` of a option is useful for building help information automatically.

**parseFn**

A function to parse the option's value, it's optional.

**defaultValue**

The option's default value.

Example:

```javascript
#!/usr/bin/env node

var app = require('cmdu');

function range(val) {
    return val.split('-').map(Number);
}

function list(val) {
    return val.split(', ');
}

// parse and default value for options
app
    .option('-i, --integer <n>', 'An integer argument', parseInt)
    .option('-f, --float <n>', 'A float argument', parseFloat)
    .option('-r, --range <m>-<n>', 'A range', range)
    .option('-l, --list <items1, items2, ...>', 'A list', list)
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
```

#### Optional or required

The option value is optional by default. And you can also declare it as `[optional]` or `<required>` explicitly. It would throw an error if users forgot to give the required option a value unless `app.allowUnknowns = true`.

#### Type of options

Option value can be boolean(default), string or array. Just prepend '...' to the option name to declare it as an array type.

#### Default value of options

You can specify a default value when define.

If you didn't specify a default value, it should be:

+ for boolean type, false, or true when with `--no-`
+ for string type, a empty string
+ for array type, a empty array

#### Passing values to options

When passing values, the input order of arguments and options are not limited.

**Boolean**

Suppose there is an option `-o, --options`, it would be `true` under the following condition:

* `-o` or `--options`
* `-o=true` or `--options=true`
* `-o true` or `--options true`

or `false` under the following condition:

* `--no-options`
* `-o=false` or `--options=false`
* `-o false` or `--options false`

**String**

Following the option flag.

**Array**

Following the option flag, values are separated by space.

### Alias name

You can use `.alias(aliases)` to specify one or more alias names for the current command.

The argument `aliases` can be an array or a string(in this condition you should use `,` or `|` to separate the multiple aliases).

### Descriptions

You can use `.describe(arg, description)` to specify description for the command or it's arguments.

It adds the description for the current command when no `arg` is specified, otherwise for the `arg`.

### Hander of the command

You can use `.action(handler)` to defined a handler to response the user's input. You can pass a callback function or it's file path.

#### Arguments of the callback

The command's arguments will also be the callback's arguments, and the next argument is a json object stores all the command's options, the last argument is also a json object which contains some useful command line args object.

#### Context of the callback

Inside the callback function, `this` will point to the current command, which means you can use `this` to obtain all properties and methods of the current command.

### Default command

There is an anonymous default command that takes over all undefined command inputs. This command has no handler by default, and can be redefined as needed.

## Help information

### Auto generated help

The help information is auto generated based on the descriptions. So when users typed `-h` or `--help` after a command, it would display the help information automatically.

```text
 $ node ./examples/npm uninstall -h

  About

    This uninstalls a package, completely removing everything npm installed on its behalf.

  Usage

    npm uninstall|remove|rm|r|un|unlink <packages> [options]                              

  Arguments

    packages                                                                      

  Options

    -S, --save             Package will be removed from your dependencies.        
    -D, --save-dev         Package will be removed from your devDependencies.     
    -O, --save-optional    Package will be removed from your optionalDependencies.
    -h, --help             output the help information                            

```

### Custom help

You can use `.customHelp()` to make a custom help information. You should pass a callback to this function, and the auto generated help would be the first argument for this callback, you should return a new string as the custom help.

You can use the [cubb](https://github.com/Spikef/cubb) syntax to style the help information.

```js
#!/usr/bin/env node

var app = require('cmdu');

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
    });

app.listen();
```

### Show help manually

You can use `.showHelp()` to display help information manually.

```javascript
var app = require('cmdu');

app
    .action(function() {
        this.showHelp();    // Show help for current command
    });

app.listen();
```

## Examples

More examples can be found under the [examples](https://github.com/Spikef/cmdu/tree/master/examples) directory. 

## License

MIT