'use strict';

var fs = require('fs');
var path = require('path');
var grammar = require(path.resolve(__dirname, './grammar'));
var visit = require('./visit');


module.exports = parse;

function parse(filepath) {
  return importAST(grammar, filepath).then(function (ast) {
    return validate(filepath, ast);
  });
}

function readFile(filepath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filepath, { encoding: 'utf8' }, function (err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

function importAST(parser, filepath, subdir) {
  if(!subdir)
    subdir = path.dirname(filepath);

  return readFile(filepath).then(function (source) {
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
      node.subdir = subdir;
      if (node.type === 'Import') {
        var subfilepath = path.resolve(path.dirname(filepath), decodeURI(node.path));
        importASTs.push(importAST(parser, subfilepath, path.dirname(subfilepath)));
      }
    });
    return Promise.all(importASTs).then(function (asts) {
      return flattenDocuments(ast, asts);
    });
  });
}

/**
 * Returns a single AST from a collection of ASTs.
 */
function flattenDocuments(ast, asts) {
  var cursor = 0;
  var needToFlattenStack = [];
  var needToFlatten;
  return visit(ast, {
    leave: function (node, key, parent, keyPath) {
      if (needToFlatten !== undefined && keyPath.join('.') === needToFlatten) {
        node.contents = node.contents.reduce(flattener, []);
        needToFlatten = needToFlattenStack.pop();
      }
      if (node.type === 'Import') {
        var pathToFlatten = keyPath.slice(0, -1).join('.');
        if (pathToFlatten !== needToFlatten) {
          needToFlattenStack.push(needToFlatten);
          needToFlatten = pathToFlatten;
        }
        return asts[cursor++].contents;
      }
    }
  });
}

function flattener(array, item) {
  if (Array.isArray(item)) {
    return item.reduce(flattener, array);
  }
  array.push(item);
  return array;
}

/**
 * Throw useful error message if a complete AST contains any errors.
 */
function validate(filepath, ast) {
  return visit(ast, {
    enter(node) {
      if (node.type === 'Document') {
        validateDocument(filepath, node);
      }
    }
  });
}

function validateDocument(filepath, ast) {
  if (!ast.title) {
    var message =
      'Primary document ' + filepath + ' is missing a title. ' +
      'It must begin with a Setext-style header. Example:\n\n' +
      'Title of Spec\n' +
      '=============\n';

    var firstItem = ast.contents && ast.contents[0];
    if (firstItem && firstItem.type === 'Section') {
      message +=
        '\nDid you mean to use Setext-style for the first title?\n\n' +
        '# ' + firstItem.title + '\n';
    }

    throw new Error(message);
  }
}
