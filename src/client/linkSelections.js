// RFC4648 url-safe base-64 encoding
var URL64Code =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var selectionLink;
var article;
var currentRange;
var currentEncodedRange;

document.addEventListener("selectionchange", handleSelectionChange);
window.addEventListener("resize", renderCurrentRange);
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
  currentEncodedRange = match[1];
  currentRange = decodeRange(currentEncodedRange);
  var rect = currentRange.getBoundingClientRect();
  var topOffset = Math.max(
    20,
    Math.floor((window.innerHeight - rect.height) * 0.4)
  );
  window.scrollTo(0, window.scrollY + rect.y - topOffset);
  var selection = document.getSelection();
  selection.empty();
  selection.addRange(currentRange);
  renderCurrentRange();
}

// If there is currently a selection on the page, render a link encoding it.
function handleSelectionChange(event) {
  var selection = document.getSelection();
  if (selection.isCollapsed) {
    if (selectionLink) {
      selectionLink.parentNode.removeChild(selectionLink);
      selectionLink = null;
    }
  } else {
    var range = selection.getRangeAt(0);
    if (
      !currentRange ||
      range.compareBoundaryPoints(Range.START_TO_START, currentRange) !== 0 ||
      range.compareBoundaryPoints(Range.END_TO_END, currentRange) !== 0
    ) {
      currentRange = range;
      currentEncodedRange = encodeRange(currentRange);
      renderCurrentRange();
    }
  }
}

function renderCurrentRange() {
  if (!currentRange) {
    return
  }
  if (!article) {
    article = document.getElementsByTagName("article")[0];
  }
  if (!selectionLink) {
    selectionLink = document.createElement("a");
    document.body.appendChild(selectionLink);
  }
  selectionLink.href = "#sel-" + currentEncodedRange;
  selectionLink.onclick = onClickHash;
  selectionLink.className = currentRange.isOutdated
    ? "outdated-selection-link"
    : "selection-link";
  selectionLink.innerText = currentRange.isOutdated ? "!" : "\u201F";
  var smallScreen = window.innerWidth < 720;
  var rect = currentRange.getBoundingClientRect();
  if (smallScreen) {
    selectionLink.style.left = Math.floor(rect.x + rect.width / 2 + window.scrollX - 13) + "px";
    selectionLink.style.top = Math.floor(rect.bottom + window.scrollY + 10) + "px";
  } else {
    var left = article.getBoundingClientRect().x;
    selectionLink.style.left = Math.floor(left + window.scrollX - 37) + "px";
    selectionLink.style.top = Math.floor(rect.y + window.scrollY - 3) + "px";
  }
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
  var startPath = encodeNodePath(range.startContainer);
  var endPath = encodeNodePath(range.endContainer);
  var commonPath = getCommonPath(startPath, endPath);
  writeList(commonPath);
  writeList(startPath.slice(commonPath.length).concat(range.startOffset));
  writeList(endPath.slice(commonPath.length).concat(range.endOffset));
  writeInt(getFNVChecksum(range.toString()));
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
  var startPath = readList();
  var endPath = readList();
  var expectedChecksum = readInt();
  var startOffset = startPath.pop();
  var startNode = decodeNodePath(commonPath.concat(startPath));
  var endOffset = endPath.pop();
  var endNode = decodeNodePath(commonPath.concat(endPath));
  var range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  range.isOutdated =
    expectedChecksum !== undefined &&
    expectedChecksum !== getFNVChecksum(range.toString());
  return range;

  function readInt() {
    var number = 0;
    var sign = 0;
    while (offset < encoded.length) {
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
    if (length != undefined) {
      var list = new Array(length);
      for (var i = 0; i < length; i++) {
        list[i] = readInt();
      }
      return list;
    }
  }
}

// A node's identity is encoded as a list of integers representing the tree
// traversal path from the document body.
function encodeNodePath(node) {
  var path = [];
  while (node != document.body) {
    var parentNode = node.parentNode;
    path.push(Array.prototype.indexOf.call(parentNode.childNodes, node));
    node = parentNode;
  }
  return path.reverse();
}

function decodeNodePath(path) {
  var node = document.body;
  for (var i = 0; i < path.length && node; i++) {
    node = node.childNodes[path[i]];
  }
  return node;
}

// Given two arrays of integers, returns the common prefix of the two.
function getCommonPath(p1, p2) {
  var i = 0;
  while (i < p1.length && i < p2.length && p1[i] === p2[i]) {
    i++;
  }
  return p1.slice(0, i);
}

// Given a string, produce a 15-bit unsigned int checksum.
// Later used to catch if a range may have changed since the link was created.
function getFNVChecksum(str) {
  var sum = 0x811c9dc5;
  for (var i = 0; i < str.length; ++i) {
    sum ^= str.charCodeAt(i);
    sum += (sum << 1) + (sum << 4) + (sum << 7) + (sum << 8) + (sum << 24);
  }
  return ((sum >> 15) ^ sum) & 0x7fff;
}
