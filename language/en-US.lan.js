module.exports = {
    help: {
        title: {
            about: 'About',
            usage: 'Usage',
            command: 'Commands',
            argument: 'Arguments',
            option: 'Options',
            example: 'Examples',
            alias: 'Alias'
        },
        message: {
            command: 'command',
            options: 'options',
            help: 'output the help information',
            version: 'output the version number'
        }
    },
    error: {
        expectFunOrStr: 'error: expect a function/file for the action',
        unknownOption: 'error: unknown option "{0}"',
        requiredOption: 'error: missing required option "{0}"',
        requiredArgument: 'error: missing required argument "{0}"',
        notExist: 'error: {0}(1) does not exist, try --help',
        notExecutable: 'error: {0}(1) not executable. try chmod or run with root'
    }
};