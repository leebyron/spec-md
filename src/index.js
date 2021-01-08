const print = require('./print');
const parse = require('./parse');
const visit = require('./visit');

async function html(filepath, options) {
  return await print(await parse(filepath), options);
}

exports.html = html;
exports.print = print;
exports.parse = parse;
exports.visit = visit;
