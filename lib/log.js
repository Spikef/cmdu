var Cubb = require('cubb');
var cubb = new Cubb({
    table: {
        margin: 0,
        padding: 4,
        titlePadding: 2
    }
});

module.exports = function(string, options) {
    var text = cubb.render(string, options);
    text = text.replace(/^\n+|\n+$/g, '');
    console.log('\n' + text + '\n');
};