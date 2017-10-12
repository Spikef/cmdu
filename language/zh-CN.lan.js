module.exports = {
    help: {
        title: {
            about: '关于',
            usage: '用法',
            commands: '命令',
            arguments: '参数',
            options: '选项',
            examples: '示例',
            aliases: '别名'
        },
        message: {
            arguments: '参数',
            options: '选项',
            help: '显示帮助信息',
            version: '显示版本号'
        }
    },
    error: {
        expectFunOrStr: '错误: 只接受回调函数或模块文件路径作为action的参数',
        unknownInput: '错误: 未知输入 "{0}"',
        requiredOption: '错误: 缺少选项 "{0}"',
        requiredArgument: '错误: 缺少参数 "{0}"',
        requiredAfterOptional: '错误: 不能在可选参数 "{0}" 后面定义必选参数 "{1}"'
    }
};