var {print, ...others} = require('./print');
var parse = require('./parse');
var visit = require('./visit');

function html(filepath, options) {
  return parse(filepath).then(function (ast) {
    return print(ast, options);
  });
}

module.exports = {
  html,
  print,
  parse,
  visit,
  ...others
}

