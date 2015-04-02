var print = require('./print');
var parse = require('./parse');
var visit = require('./visit');

function html(filepath, options) {
  return parse(filepath).then(function (ast) {
    return print(ast, options);
  });
}

exports.html = html;
exports.print = print;
exports.parse = parse;
exports.visit = visit;
