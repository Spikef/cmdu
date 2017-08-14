module.exports = function(packages, options, result) {
    console.log('packages:');
    console.log(packages);
    console.log('');
    console.log('options:');
    console.log(options);
    console.log('');
    console.log('unknowns:');
    console.log(result.unknowns);
    console.log('');
    console.log('honors:');
    console.log(result.honors);
};