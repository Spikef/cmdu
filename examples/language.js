var app = require('../');

// built-in language
// app.language = 'zh-CN';

// or a custom object
app.language = {
    help: {
        title: {
            about: '關於',
            usage: '用法',
            commands: '命令',
            arguments: '參數',
            options: '選項',
            examples: '示例',
            aliases: '別名'
        },
        message: {
            arguments: '參數',
            options: '選項',
            help: '顯示幫助信息',
            version: '顯示版本號'
        }
    },
    error: {
        expectFunOrStr: '錯誤: 只接受回調函數或模塊文件路徑作為action的參數',
        unknownInput: '錯誤: 未知輸入 "{0}"',
        requiredOption: '錯誤: 缺少選項 "{0}"',
        requiredArgument: '錯誤: 缺少參數 "{0}"'
    }
};

app.listen();