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
  return fs.readFileAsync(filepath, { encoding: 'utf8' }).then(function (md) {
    var ast = parser.parse(md);
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
