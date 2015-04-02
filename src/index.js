var beautify = require('js-beautify');
var print = require('./print');
var parse = require('./parse');
var visit = require('./visit');

function html(filepath, options) {
  return parse(filepath).then(function (ast) {
    var rawHTML = print(ast, options);
    return beautify.html(rawHTML, {
      indent_size: 2,
    });
  });
}

exports.html = html;
exports.print = print;
exports.parse = parse;
exports.visit = visit;
