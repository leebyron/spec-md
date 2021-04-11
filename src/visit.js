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
  const visitorKeys = visitor.keys;
  const visitorKeyProp = visitor.keyProp;
  if (visitorKeys && !visitorKeyProp) {
    throw new Error('Must provide keyProp in addition to keys');
  }

  let stack;
  let inArray = Array.isArray(root);
  let keys = [root];
  let index = -1;
  let edits = [];
  let parent;
  let path = [];
  let ancestors = [];

  do {
    index++;
    const isLeaving = index === keys.length;
    const isEdited = isLeaving && edits.length !== 0;
    let key, node;
    if (isLeaving) {
      key = ancestors.length === 0 ? undefined : path.pop();
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        node = inArray ? node.slice() : Object.defineProperties({}, Object.getOwnPropertyDescriptors(node));
        for (let ii = 0; ii < edits.length; ii++) {
          const editKey = edits[ii][0];
          const editValue = edits[ii][1];
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
      if (!canVisit(node)) {
        continue;
      }
      if (parent) {
        path.push(key);
      }
    }

    let result = undefined;
    if (!Array.isArray(node)) {
      const visitFn = isLeaving ? visitor.leave : visitor.enter;
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
            if (canVisit(result)) {
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

function canVisit(value) {
  return (
    value != null &&
    typeof value === 'object' &&
    ('type' in value || Array.isArray(value))
  );
}

const BREAK = visit.BREAK = {};

module.exports = visit;
