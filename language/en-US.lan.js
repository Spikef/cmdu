module.exports = {
    help: {
        title: {
            about: 'About',
            usage: 'Usage',
            commands: 'Commands',
            arguments: 'Arguments',
            options: 'Options',
            examples: 'Examples',
            aliases: 'Aliases'
        },
        message: {
            arguments: 'arguments',
            options: 'options',
            help: 'output the help information',
            version: 'output the version number'
        }
    },
    error: {
        expectFunOrStr: 'error: expect a function/file for the action',
        unknownInput: 'error: unknown input "{0}"',
        requiredOption: 'error: missing required option "{0}"',
        requiredArgument: 'error: missing required argument "{0}"',
        requiredAfterOptional: 'error: don\'t define the required argument "{1}" after the optional "{0}"'
    }
};