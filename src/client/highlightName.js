var styleSheet = document.getElementsByTagName('style')[0].sheet;
var ruleIndex;

function removeHighlight() {
  if (ruleIndex) {
    styleSheet.deleteRule(ruleIndex);
    ruleIndex = void 0;
  }
}

function highlightKeyword(name) {
  removeHighlight();
  ruleIndex = styleSheet.insertRule(
    '*[data-name="' + name + '"] { background: rgba(230,215,0,0.12); }',
    styleSheet.cssRules.length
  );
}

document.documentElement.addEventListener('mouseover', function (event) {
  var nameAttribute = event.target.attributes['data-name'];
  if (nameAttribute) {
    highlightKeyword(nameAttribute.value);
  }
});

document.documentElement.addEventListener('mouseout', removeHighlight);
