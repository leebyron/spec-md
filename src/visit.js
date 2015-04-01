/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * visit(root, {
 *   keyProp: 'type',
 *   keys: { 'Foo': [ 'bar', 'baz' ] },
 *   enter(node, key, parent, path, ancestors) {
 *     // @return
 *     //   undefined: no action
 *     //   false: skip visiting this node
 *     //   visitor.BREAK: stop visiting altogether
 *     //   null: delete this node
 *     //   any value: replace this node with the returned value
 *   },
 *   leave(node, key, parent, path, ancestors) {
 *     // @return
 *     //   undefined: no action
 *     //   visitor.BREAK: stop visiting altogether
 *     //   null: delete this node
 *     //   any value: replace this node with the returned value
 *   }
 * })
 */
function visit(root, visitor) {
  if (typeof visitor === 'function') {
    visitor = { enter: visitor };
  }
  var visitorKeys = visitor.keys;
  var visitorKeyProp = visitor.keyProp;
  if (visitorKeys && !visitorKeyProp) {
    throw new Error('Must provide keyProp in addition to keys');
  }

  var stack;
  var inArray = Array.isArray(root);
  var keys = [root];
  var index = -1;
  var edits = [];
  var parent;
  var path = [];
  var ancestors = [];

  do {
    index++;
    var isLeaving = index === keys.length;
    var key, node;
    var isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? undefined : path.pop();
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        node = inArray ? node.slice() :
          Object.keys(node).reduce(function (o, k) {
            o[k] = node[k];
            return o;
          }, {});
        for (var ii = 0; ii < edits.length; ii++) {
          var editKey = edits[ii][0];
          var editValue = edits[ii][1];
          if (editValue === null && inArray) {
            node.splice(editKey, 1);
          } else {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else {
      key = parent ? inArray ? index : keys[index] : undefined;
      node = parent ? parent[key] : root;
      if (node === null || node === undefined || typeof node !== 'object') {
        continue;
      }
      if (parent) {
        path.push(key);
      }
    }

    var result = undefined;
    if (!Array.isArray(node)) {
      var visitFn = isLeaving ? visitor.leave : visitor.enter;
      if (visitFn) {
        result = visitFn.call(visitor, node, key, parent, path, ancestors);

        if (result === BREAK) {
          break;
        }

        if (!isLeaving && result === false) {
          path.pop();
          continue;
        }

        if (result !== undefined) {
          edits.push([key, result]);
          if (!isLeaving) {
            if (typeof result === 'object') {
              node = result;
            } else {
              path.pop();
              continue;
            }
          }
        }
      }
    }

    if (result === undefined && isEdited) {
      edits.push([key, node]);
    }

    if (!isLeaving) {
      stack = {
        inArray: inArray,
        index: index,
        keys: keys,
        edits: edits,
        prev: stack
      };
      inArray = Array.isArray(node);
      if (visitorKeyProp && visitorKeys) {
        key = node[visitorKeyProp];
        keys = inArray ? node : visitorKeys[key];
      } else {
        keys = inArray ? node : Object.keys(node);
      }
      index = -1;
      edits = [];
      if (parent) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== undefined);

  if (edits.length !== 0) {
    root = edits[0][1];
  }

  return root;
};

var BREAK = visit.BREAK = {};

module.exports = visit;
