'use strict';

var fs = require('fs');
var path = require('path');
var pegjs = require('pegjs');
var Promise = require('bluebird');
var print = require('./print');
var visit = require('./visit');

Promise.promisifyAll(fs);


var _outDir;
function getOutDir() {
  var dirName = __dirname + '/../out';
  return _outDir || (_outDir =
    exists(dirName).then(function (exists) {
      if (!exists) {
        return fs.mkdirAsync(dirName).then(function () {
          return dirName;
        });
      }
      return dirName;
    })
  );
}

function exists(dirName) {
  return new Promise(function (resolve) {
    fs.exists(dirName, resolve);
  });
}

printSpecHTML(__dirname + '/../README.md').then(function (html) {
  return getOutDir().then(function (outDir) {
    return Promise.all([
      fs.readFileAsync(__dirname + '/../css/spec.css', { encoding: 'utf8' }).then(function (css) {
        return fs.writeFileAsync(outDir + '/spec.css', css, { encoding: 'utf8' });
      }),
      fs.readFileAsync(__dirname + '/../css/highlight.css', { encoding: 'utf8' }).then(function (css) {
        return fs.writeFileAsync(outDir + '/highlight.css', css, { encoding: 'utf8' });
      }),
      fs.writeFileAsync(outDir + '/index.html', html, { encoding: 'utf8' }),
    ]);
  });
}).catch(function (error) {
  console.log(error);
  throw error;
});


///////////////////////////

function printSpecHTML(filepath, options) {
  return getParser().then(function (parser) {
    return importAST(parser, filepath);
  }).then(function (ast) {
    return print(ast, options);
  });
}

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
  var md = fs.readFileAsync(filepath, { encoding: 'utf8' });
  return md.then(function (md) {
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
