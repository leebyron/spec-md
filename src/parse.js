'use strict';

const fs = require('fs');
const path = require('path');
const grammar = require('./generated/grammar');
const visit = require('./visit');


module.exports = parse;

function parse(filepath) {
  return importAST(filepath, 'initialDocument');
}

function readFile(filepath) {
  return fs
    .readFileSync(filepath, { encoding: "utf8" })
    // Normalize line endings
    .replace(/\r\n|\n|\r/g, '\n');
}

function importAST(filepath, startRule) {
  const contents = readFile(filepath)
  const source = path.relative(process.cwd(), filepath);
  const ast = parseSpecMD(contents, source, startRule);
  const importASTs = [];
  visit(ast, function (node) {
    if (node.type === 'Import') {
      const subfilepath = path.resolve(
        path.dirname(filepath),
        decodeURI(node.path)
      );
      importASTs.push(importAST(subfilepath, 'importedDocument'));
    }
  });
  return flattenDocuments(ast, importASTs);
}

function parseSpecMD(contents, source, startRule) {
  try {
    return grammar.parse(contents, { startRule, source });
  } catch (error) {
    if (error && error.location) {
      error.source = source;
      const lines = contents.split('\n');
      const start = error.location.start;
      let location = source + ':' + start.line + ':' + start.column + '\n';
      let lineChars = String(start.line + 1).length
      if (start.line > 1) {
        location +=
          String(start.line - 1).padStart(lineChars) + ' | ' +
          lines[start.line - 2] + '\n';
      }
      if (start.line > 1) {
        location +=
          String(start.line).padStart(lineChars) + ' | ' +
          lines[start.line - 1] + '\n';
      }
      location += Array(start.column + lineChars + 3).join(' ') + '^\n';
      error.message += '\n\n' + location;
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
