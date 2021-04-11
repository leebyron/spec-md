var elemWithSource;
var article;
var sourceLink;

document.addEventListener('pointerover', handlePointerOver);
document.addEventListener('pointerleave', removeSourceLink);
window.addEventListener('resize', renderSourceLink);

var DISALLOWED = { OL: 1, UL: 1 }

function handlePointerOver(event) {
  var elem = event.target;
  if (elem.nodeType === Node.ELEMENT_NODE) {
    while (elem && !elem.getAttribute('data-source')) {
      // Don't crawl up through
      if (DISALLOWED[elem.nodeName]) {
        return;
      }
      elem = elem.parentElement;
    }
    if (elem && elem !== elemWithSource) {
      elemWithSource = elem;
      renderSourceLink();
    }
  }
}

function renderSourceLink() {
  if (!elemWithSource) {
    return;
  }
  if (!article) {
    article = document.getElementsByTagName('article')[0];
  }
  if (!sourceLink) {
    sourceLink = document.createElement('a');
    sourceLink.className = 'source-link';
    sourceLink.target = '_blank';
    sourceLink.innerHTML = '<svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>'
    document.body.appendChild(sourceLink);
  }
  sourceLink.href = article.getAttribute('data-source-base') + elemWithSource.getAttribute('data-source');
  var leaf = firstContentNode(elemWithSource);
  var range = document.createRange();
  if (leaf.nodeType === Node.TEXT_NODE) {
    range.setStart(leaf, 0);
  } else {
    range.selectNode(leaf);
  }
  var rect = range.getBoundingClientRect();
  range.detach();
  var top = rect.y + rect.height / 2 - 9;
  var left = article.getBoundingClientRect().x - 95;
  sourceLink.style.left = Math.floor(window.scrollX + left) + 'px';
  sourceLink.style.top = Math.floor(window.scrollY + top) + 'px';
}

function firstContentNode(node) {
  recur: while (node) {
    for (var n = node.childNodes, i = 0; n && i < n.length; i++) {
      var child = n[i];
      if (
        child.nodeType === Node.ELEMENT_NODE ||
        (child.nodeType === Node.TEXT_NODE && !/^\s*$/.test(child.data))
      ) {
        node = child;
        continue recur;
      }
    }
    return node;
  }
}

function removeSourceLink() {
  if (sourceLink) {
    sourceLink.parentNode.removeChild(sourceLink);
    sourceLink = null;
  }
}
