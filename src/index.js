const print = require('./print');
const parse = require('./parse');
const visit = require('./visit');

function html(filepath, options) {
  return print(parse(filepath), options);
}

exports.html = html;
exports.print = print;
exports.parse = parse;
exports.visit = visit;
