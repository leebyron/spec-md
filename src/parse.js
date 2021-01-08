'use strict';

const fs = require('fs');
const path = require('path');
const grammar = require('./grammar');
const visit = require('./visit');


module.exports = parse;

async function parse(filepath) {
  const ast = await importAST(grammar, filepath);
  return validate(filepath, ast);
}

function readFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, { encoding: 'utf8' }, (err, result) =>
      err ? reject(err) : resolve(result)
    );
  });
}

async function importAST(parser, filepath) {
  const source = await readFile(filepath)
  try {
    const ast = parser.parse(source);
    const importASTs = [];
    visit(ast, function (node) {
      if (node.type === 'Import') {
        const subfilepath = path.resolve(
          path.dirname(filepath),
          decodeURI(node.path)
        );
        importASTs.push(importAST(parser, subfilepath));
      }
    });
    const asts = await Promise.all(importASTs);
    return flattenDocuments(ast, asts);
  } catch (error) {
    if (error && error.line) {
      error.message =
        filepath + ':' + error.line + ':' + error.column + '\n' +
        source.split(/\r\n|\n|\r/g)[error.line - 1] + '\n' +
        Array(error.column).join(' ') + '^\n' +
        error.message;
    }
    throw error;
  }
}

/**
 * Returns a single AST from a collection of ASTs.
 */
function flattenDocuments(ast, asts) {
  let cursor = 0;
  const needToFlattenStack = [];
  let needToFlatten;
  return visit(ast, {
    leave: function (node, key, parent, keyPath) {
      if (needToFlatten !== undefined && keyPath.join('.') === needToFlatten) {
        node.contents = node.contents.reduce(flattener, []);
        needToFlatten = needToFlattenStack.pop();
      }
      if (node.type === 'Import') {
        const pathToFlatten = keyPath.slice(0, -1).join('.');
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
    const message =
      'Primary document ' + filepath + ' is missing a title. ' +
      'It must begin with a Setext-style header. Example:\n\n' +
      'Title of Spec\n' +
      '=============\n';

    const firstItem = ast.contents && ast.contents[0];
    if (firstItem && firstItem.type === 'Section') {
      message +=
        '\nDid you mean to use Setext-style for the first title?\n\n' +
        '# ' + firstItem.title + '\n';
    }

    throw new Error(message);
  }
}
