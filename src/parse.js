'use strict';

var fs = require('fs');
var path = require('path');
var pegjs = require('pegjs');
var Promise = require('bluebird');
var visit = require('./visit');

Promise.promisifyAll(fs);

function parse(filepath) {
  return getParser().then(function (parser) {
    return importAST(parser, filepath);
  });
}

module.exports = parse;

var _parser;
function getParser() {
  return _parser || (_parser =
    fs.readFileAsync(__dirname + '/grammar.pegjs', 'utf8').then(function (text) {
      return pegjs.buildParser(text, {
        output: 'parser',
        allowedStartRules: ['document']
      });
    })
  );
}

function importAST(parser, filepath) {
  return fs.readFileAsync(filepath, { encoding: 'utf8' }).then(function (source) {
    try {
      var ast = parser.parse(source);
    } catch (error) {
      error.message =
        filepath + ':' + error.line + ':' + error.column + '\n' +
        source.split(/\r\n|\n|\r/g)[error.line - 1] + '\n' +
        Array(error.column).join(' ') + '^\n' +
        error.message;
      throw error;
    }
    var importASTs = [];
    visit(ast, function (node) {
      if (node.type === 'Import') {
        var subfilepath = path.resolve(path.dirname(filepath), node.path);
        importASTs.push(importAST(parser, subfilepath));
      }
    });
    return Promise.all(importASTs).then(function (asts) {
      var cursor = 0;
      var needToFlattenContents = false;
      return visit(ast, {
        leave: function (node) {
          if (needToFlattenContents) {
            node.contents = node.contents.reduce(flattener, []);
          }
          if (node.type === 'Import') {
            needToFlattenContents = true;
            return asts[cursor++].contents;
          } else {
            needToFlattenContents = false;
          }
        }
      });
    });
  });
}

function flattener(array, item) {
  if (Array.isArray(item)) {
    return item.reduce(flattener, array);
  }
  array.push(item);
  return array;
}
