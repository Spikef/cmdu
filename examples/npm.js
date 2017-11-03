var app = require('../');

app.name = 'npm';
app.version = '1.0.0';
app.language = 'en-US';
app.allowUnknowns = true;

app
    .describe('Node packages management')
    .action(function() {
        this.showHelp();
    });

app
    .command('install [...packages]', 'This command installs a package, and any packages that it depends on.')
    .alias('i')
    .describe('packages', 'Could be a package\'s name, a directory, a tarball file or url')
    .option('-P, --save-prod', 'Package will appear in your dependencies. This is the default unless -D or -O are present.')
    .option('-D, --save-dev', 'Package will appear in your devDependencies.')
    .option('-O, --save-optional', 'Package will appear in your optionalDependencies.')
    .option('--no-save', 'Prevents saving to dependencies.')
    .option('-E, --save-exact', 'Saved dependencies will be configured with an exact version rather than using npm\'s default semver range operator.')
    .option('-B, --save-bundle', 'Saved dependencies will also be added to your bundleDependencies list.')
    .option('--tag [tag]', 'The --tag argument will apply to all of the specified install targets.', 'latest')
    .option('--dry-run', 'The --dry-run argument will report in the usual way what the install would have done without actually installing anything.')
    .option('-f, --force', 'The -f or --force argument will force npm to fetch remote resources even if a local copy exists on disk.')
    .option('-g, --global', 'The -g or --global argument will cause npm to install the package globally rather than locally.')
    .option('--global-style', 'The --global-style argument will cause npm to install the package into your local node_modules folder with the same layout it uses with the global node_modules folder.')
    .option('--ignore-scripts', 'The --ignore-scripts argument will cause npm to not execute any scripts defined in the package.json.')
    .option('--legacy-bundling', 'The --legacy-bundling argument will cause npm to install the package such that versions of npm prior to 1.4.')
    .option('--link', 'The --link argument will cause npm to link global installs into the local space in some cases.')
    .option('--no-bin-links', 'The --no-bin-links argument will prevent npm from creating symlinks for any binaries the package might contain.')
    .option('--no-optional', 'The --no-optional argument will prevent optional dependencies from being installed.')
    .option('--no-shrinkwrap', 'The --no-shrinkwrap argument, which will ignore an available package lock or shrinkwrap file and use the package.json instead.')
    .option('--no-package-lock', 'The --no-package-lock argument will prevent npm from creating a package-lock.json file.')
    .option('--nodedir', 'The --nodedir=/path/to/node/source argument will allow npm to find the node source code so that npm can compile native modules.')
    .action('npm/install');

app
    .command('uninstall <...packages>', 'This uninstalls a package, completely removing everything npm installed on its behalf.')
    .alias('remove, rm, r, un, unlink')
    .option('-S, --save', 'Package will be removed from your dependencies.', true)
    .option('-D, --save-dev', 'Package will be removed from your devDependencies.', true)
    .option('-O, --save-optional', 'Package will be removed from your optionalDependencies.')
    .action('npm/uninstall');

app.listen();