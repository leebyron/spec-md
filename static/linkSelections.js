// RFC4648 url-safe base-64 encoding
var URL64Code =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var selectionLink;
var article;

document.addEventListener("selectionchange", renderLinkedSelection);
window.addEventListener("resize", renderLinkedSelection);
window.addEventListener("hashchange", scrollToWindowLocation);
window.addEventListener("load", scrollToWindowLocation);

function onClickHash(event) {
  scrollToSelectionHash(new URL(event.target.href));
}

function scrollToWindowLocation() {
  scrollToSelectionHash(window.location);
}

// Given a URL with a selection hash, decode it, apply it, and scroll to it.
function scrollToSelectionHash(url) {
  var match = url.hash.match(/^#sel-([A-Za-z0-9-_]+)$/);
  if (!match) {
    return;
  }
  var selection = document.getSelection();
  var range = decodeRange(match[1]);
  var rect = range.getBoundingClientRect();
  var topOffset = Math.max(
    20,
    Math.floor((window.innerHeight - rect.height) * 0.4)
  );
  window.scrollTo(0, window.scrollY + rect.y - topOffset);
  selection.empty();
  selection.addRange(range);
}

// If there is currently a selection on the page, render a link encoding it.
function renderLinkedSelection() {
  var selection = document.getSelection();
  if (selection.isCollapsed) {
    if (selectionLink) {
      selectionLink.parentNode.removeChild(selectionLink);
      selectionLink = null;
    }
    return;
  }
  var range = selection.getRangeAt(0);
  var rect = range.getBoundingClientRect();
  var encoded = encodeRange(range);
  if (!article) {
    article = document.getElementsByTagName("article")[0];
  }
  if (!selectionLink) {
    selectionLink = document.createElement("a");
    selectionLink.className = "selection-link";
    selectionLink.innerText = "\u201F";
    document.body.appendChild(selectionLink);
  }
  var left = article.getBoundingClientRect().x;
  selectionLink.href = "#sel-" + encoded;
  selectionLink.onclick = onClickHash;
  selectionLink.style.left = Math.floor(left + window.scrollX - 37) + "px";
  selectionLink.style.top = Math.floor(rect.y + window.scrollY - 3) + "px";
}

// Encodes the range of a selection on the page as a string. The string is a
// URL-safe Base64 encoded hexad stream. While we could have used a byte stream,
// using hexads removes the need to convert Base64's hexads to bytes.
// A range is encoded as three lists of unsigned ints. The first list is the
// tree traversal path to the common ancestor node of the selection. The second
// is the tree traversal path from the common node to the start container,
// followed by the index into the text at that node, and the third is from the
// common node to the end container and the end text index.
function encodeRange(range) {
  var encoded = "";
  var startPath = encodeRangePoint(range.startContainer, range.startOffset);
  var endPath = encodeRangePoint(range.endContainer, range.endOffset);
  var commonPath = getCommonPath(startPath, endPath);
  writeList(commonPath);
  writeList(startPath.slice(commonPath.length));
  writeList(endPath.slice(commonPath.length));
  return encoded;

  // Unsigned ints are represented in a go-style varint encoding. Each hexad
  // holds 5 bits of value and a MSB indicating if there are subsequent hexads
  // representing this int.
  function writeInt(number) {
    do {
      encoded += URL64Code[(number & 0x1f) | (number > 0x1f ? 0x20 : 0)];
      number >>= 5;
    } while (number > 0);
  }

  // Lists are written as one int indicating the list's length, followed by each
  // element in that list.
  function writeList(list) {
    writeInt(list.length);
    for (var i = 0; i < list.length; i++) {
      writeInt(list[i]);
    }
  }
}

function decodeRange(encoded) {
  var URL64Decode = new Array(64);
  for (var i = 0; i < 64; i++) {
    URL64Decode[URL64Code.charCodeAt(i)] = i;
  }
  var offset = 0;
  var commonPath = readList();
  var startPoint = decodeRangePoint(commonPath.concat(readList()));
  var endPoint = decodeRangePoint(commonPath.concat(readList()));
  var range = document.createRange();
  range.setStart(startPoint[0], startPoint[1]);
  range.setEnd(endPoint[0], endPoint[1]);
  return range;

  function readInt() {
    var number = 0;
    var sign = 0;
    while (true) {
      var byte = URL64Decode[encoded.charCodeAt(offset++)];
      number |= (byte & 0x1f) << sign;
      sign += 5;
      if (byte < 0x20) {
        return number;
      }
    }
  }

  function readList() {
    var length = readInt();
    var list = new Array(length);
    for (var i = 0; i < length; i++) {
      list[i] = readInt();
    }
    return list;
  }
}

// A range point is a tuple of a node, and offset into that node. We encode it
// as a list of integers representing the tree traversal path from the document
// body, followed by the text offset.
function encodeRangePoint(node, offset) {
  var path = [offset];
  while (node != document.body) {
    var parentNode = node.parentNode;
    path.push(Array.prototype.indexOf.call(parentNode.childNodes, node));
    node = parentNode;
  }
  return path.reverse();
}

function decodeRangePoint(path) {
  var node = document.body;
  for (var i = 0; i < path.length - 1 && node; i++) {
    node = node.childNodes[path[i]];
  }
  return [node, path[path.length - 1]];
}

// Given two arrays of integers, returns the common prefix of the two.
function getCommonPath(p1, p2) {
  var i = 0;
  while (i < p1.length && i < p2.length && p1[i] === p2[i]) {
    i++;
  }
  return p1.slice(0, i);
}
