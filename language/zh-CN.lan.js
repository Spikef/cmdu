module.exports = {
    help: {
        title: {
            about: '关于',
            usage: '用法',
            command: '命令',
            argument: '参数',
            option: '选项',
            example: '示例',
            alias: '别名'
        },
        message: {
            command: '命令',
            options: '选项',
            help: '显示帮助信息',
            version: '显示版本号'
        }
    },
    error: {
        expectFunOrStr: '错误: 只接受回调函数或模块文件路径作为action的参数',
        unknownOption: '错误: 未知选项 "{0}"',
        requiredOption: '错误: 缺少选项 "{0}"',
        requiredArgument: '错误: 缺少参数 "{0}"',
        notExist: '错误: {0}(1) 不存在, 请使用 --help 查看帮助信息',
        notExecutable: '错误: {0}(1) 无法执行. 请使用 chmod 修改权限或以管理员身份运行'
    }
};