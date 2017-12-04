# cmdu

[![Build Status](https://travis-ci.org/Spikef/cmdu.svg?branch=master)](https://travis-ci.org/Spikef/cmdu)
[![Coverage Status](https://coveralls.io/repos/github/Spikef/cmdu/badge.svg?branch=master)](https://coveralls.io/github/Spikef/cmdu?branch=master)
[![NPM Version](http://img.shields.io/npm/v/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![NPM Downloads](https://img.shields.io/npm/dm/cmdu.svg?style=flat)](https://www.npmjs.org/package/cmdu)
[![cmdu starter](https://img.shields.io/badge/cmdu-starter-brightgreen.svg)](https://www.npmjs.org/package/cmdu-cli)

`cmdu`致力于让你更好地构建中大型的`node.js`命令行工具。

[Documents](/README.md)

## 安装

```bash
$ npm install cmdu
```
    
或安装一个全局的cli工具以快速开始

```bash
$ npm install cmdu-cli -g
```

## 使用

```javascript
#!/usr/bin/env node

var app = require('cmdu');

// do something as you like

app.listen();   // listen the user input at last
```

## 全局设置

### 应用名称

修改`app.name`属性可以定义应用名称，通常只有需要使用`app.toSource()`方法时才需要定义。

### 版本号

设置命令行应用的版本号。

```javascript
#!/usr/bin/env node

var app = require('cmdu');
app.version = '0.0.1';

// node index -v
// node index --version
// prints: 0.0.1
```

### 允许未知选项与参数

设置`app.allowUnknowns = true`可以允许用户输入未定义的参数和选项，默认情况下如果用户输入了未定义的参数或选项时会抛出错误。

### 允许容错输入

设置`app.allowTolerance = true`可以允许用户输入错误时自动找到比较接近的命令来处理。

### 多语言支持

你可以自定义语言，预定义语言可以在`language`目录中找到。

```javascript
// 使用预定义的语言名称
app.language = 'zh-CN';     // 可以为 'zh-CN, en-US'

// 或者一个完整的语言对象
app.language = {};
```

## 全局方法

### app.toSource()

返回当前命令的完整输入。

### app.listen()

监听用户输入，该方法将自动解析用户输入，并执行命令对应的方法。

并非所有情况下都需要调用`listen`方法，如果你的代码里面没有异步操作，则可以省略调用`listen`方法，当进程结束时，该方法将被自动调用。

### app.command()

定义一个新命令并返回一个`Command`对象，详见[定义命令](#定义命令)。

### app.extends()

扩展一个已有命令，当被扩展的命令不存在时，该方法等同于定义一个新命令。

### app.log()

使用[cubb](https://github.com/Spikef/cubb)的`render`方法向命令行输出字符串。

## 定义命令

一个命令包含了定义(cmd)，名称(name)，描述(description)，配置项以及[参数](#命令参数)和[选项](#命令选项)。

定义一个命令的完整语法为:

```javascript
app.command(cmd, description, options);
```

**cmd**

`cmd`是一个字符串，用空格分隔。第一部分为命令名称，剩余部分将作为该命令的参数传入。如果省略第一部分，则表示是[默认命令](#默认命令)。

**description**

`description`表示该命令的描述，主要用于自动生成帮助信息。也可以省略该参数，使用`options.description`来指定。

**options**

`options`定义了该命令的一些额外配置项。

+ options.noHelp: 布尔值，指定是否在默认命令的帮助中显示此命令
+ options.isBase: 布尔值，指定该命令仅仅只是一个定义，而非一个真实的命令，这通常用于定义一个mixin给其它命令来使用
+ options.mixins: 数组，指定此命令要混入的其它命令，将自动继承混入命令的命令选项

下面是定义命令的示例:

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

### 命令参数

一个命令参数包含了名称(name)，描述(description)，是否必需指定值，参数类型及默认值。

#### 必需参数与可选参数

参数默认是必需的，也可以显式地声明为`[可选的]`还是`<必需的>`。如果定义了一个必需输入的参数而用户忘记给定值，则将在命令行输出错误提示，除非设置了`app.allowUnknowns = true`。

注意: `[可选的]`参数只能在`<必需的>`参数后面定义。

#### 参数值类型

参数值可以是字符串或者数组，定义参数值为数组类型的方法很简单，只需要在参数前面加上`...`即可。

注意: 只有最后一个参数才能被定义为数组类型。

#### 参数默认值

在参数后面加上`=defaultValue`即可给参数指定一个默认值。

如果未指定默认值，则按照以下原则给定默认值:

+ 对于字符串而言，默认为空字符串
+ 对于数组而言，默认为空数组

#### 给参数传值

用户传值时，不限制参数与选项的输入先后顺序。

**字符串类型**

按照参数定义的先后顺序依次指定。

**数组类型**

多个参数值需要以空格分隔。

### 命令选项

使用`.option()`方法可以给当前命令添加一个命令选项。

一个命令选项包含了定义(opt)，名称(name)，描述(description)，是否必需指定值，参数类型，转换函数和默认值。

定义一个命令的完整语法为:

```javascript
command.option(flags, description, parseFn, defaultValue);
```

**flags**

`flags`包含三部分：短标识(可选)，长标识(必需)和选项属性(可选)。

长标识去掉前面的`--`或者`--no-`即为选项名称。如果选项名称包含多个单词并使用`-`连接(如"--template-engine")，那么将对其进行驼峰转换为`options.templateEngine`。

选项属性用于指定该选项是`[可选的]`还是`<必需的>`。

**description**

`description`表示该命令选项的描述，主要用于自动生成帮助信息。

**parseFn**

一个函数，对用户输入的该选项的值进行转换，可以省略。

**defaultValue**

选项的默认值。

下面是定义命令选项的示例:

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

#### 必需选项与可选选项

选项默认为可选的，当选项的值不是布尔值类型时，可以显式地声明为`[可选的]`还是`<必需的>`。如果定义了一个必需输入的选项而用户忘记给定值，则将在命令行输出错误提示，除非设置了`app.allowUnknowns = true`。

#### 选项值类型

选项值可以是布尔值(默认)，字符串或者数组，定义选项值为数组类型的方法很简单，只需要在选项属性前面加上`...`即可。

#### 选项默认值

可以在定义选项时通过传参的方式指定默认值。

如果未指定默认值，则按照以下原则给定默认值:

+ 对于布尔值而言，默认为false，当有`--no-`时默认为true
+ 对于字符串而言，默认为空字符串
+ 对于数组而言，默认为空数组

#### 给选项传值

用户传值时，不限制参数与选项的输入先后顺序。

**布尔值类型**

假设有选项`-o, --options`，以下情况均为`true`:

* `-o`或`--options`
* `-o=true`或`--options=true`
* `-o true`或`--options true`

以下情况均为`false`:

* `--no-options`
* `-o=false`或`--options=false`
* `-o false`或`--options false`

**字符串类型**

在选项标识后面紧跟选项值。

**数组类型**

在选项标识后面紧跟选项值，多个选项值需要以空格分隔。

### 命令别名

可以使用`.alias(aliases)`方法为当前命令添加一个或多个别名。

参数`aliases`可以是一个数组，也可以是一个字符串(此时可以使用`,`或`|`分隔多个别名)。

### 命令描述

使用`.describe(arg, description)`方法可以为当前命令或参数添加帮助描述。

当没有指定`arg`时，表示为当前命令添加描述；否则将为`arg`对应的命令参数添加描述。

### 命令响应操作

使用`.action(handler)`方法传入一个回调函数或回调函数模块的路径(相对于定义该命令的脚本文件路径)，用于响应用户输入该命令时的操作。

#### 回调函数的参数

定义的命令参数将依次作为回调函数的参数传入；下一个参数是一个json对象(options)，保存了所有该命令的选项；最后一个参数也是一个json对象(result)，包含了一些其它可能用到的命令行参数信息。

#### 回调函数的上下文

在回调函数内部，`this`将指向当前命令，这意味着你可以使用`this`获取当前命令的所有属性和方法。

### 默认命令

`cmdu`包含一个匿名的默认命令，该命令将接管所有未定义的命令输入。该命令默认没有响应操作，可以根据需要重定义默认命令的行为。


## 帮助信息

### 自动生成帮助信息

定义命令和命令选项时加入的帮助描述信息，将自动组织成命令帮助。这样当用户在命令后面输入`-h`或者`---help`时，将自动显示帮助内容。

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

### 自定义帮助信息

你可以使用`.customHelp()`方法来自定义帮助信息，该方法需要传入一个回调函数，回调函数的参数为自动生成的帮助信息字符串，返回值为新的帮助内容。

帮助信息可以使用[cubb](https://github.com/Spikef/cubb)语法来自定义样式。

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

### 手动显示帮助信息

使用`.showHelp()`方法可以手动显示帮助信息。

```javascript
var app = require('cmdu');

app
    .action(function() {
        this.showHelp();    // 显示当前命令的帮助信息
    });

app.listen();
```

## 示例

你可以在[examples](https://github.com/Spikef/cmdu/tree/master/examples)目录中找到更多示例。

## License

MIT