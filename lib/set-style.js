var styles = {
    bold: [1, 22],
    italic: [3, 23],
    underline: [4, 24],
    strikethrough: [9, 29]
};

Object.keys(styles).forEach(function(name) {
    var style = styles[name];
    styles[name] = {
        start: '\u001B[' + style[0] + 'm',
        close: '\u001B[' + style[1] + 'm'
    }
});

var setStyle = function(text) {
    var names = Array.prototype.slice.call(arguments, 1);
    names.forEach(function(name) {
        if (styles[name]) {
            text = styles[name].start + text + styles[name].close;
        }
    });
    
    return text;
}

setStyle.bold = function(text) {
    return setStyle(text, 'bold');
}

setStyle.italic = function(text) {
    return setStyle(text, 'italic');
}


setStyle.underline = function(text) {
    return setStyle(text, 'underline');
}

setStyle.strikethrough = function(text) {
    return setStyle(text, 'strikethrough');
}

module.exports = setStyle;