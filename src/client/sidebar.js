var currentSection;
var numberedSections = [];

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'interactive') {
    initializeFocus();
  }
});

function initializeFocus() {
  var sidebarButton = document.querySelector('label[for="spec-sidebar-toggle"]');
  sidebarButton.addEventListener('scroll', prevent);
  sidebarButton.addEventListener('touchmove', prevent);
  function prevent(event) {
    event.preventDefault();
  }

  var sections = document.getElementsByTagName('section');
  for (var i = 0; i < sections.length; i++) {
    if (sections[i].getAttribute('secid')) {
      numberedSections.push(sections[i]);
    }
  }

  var scrollPos = window.scrollY;
  var pending = false;
  window.addEventListener('scroll', function (e) {
    scrollPos = window.scrollY;
    if (!pending) {
      pending = true;
      window.requestAnimationFrame(function () {
        updateSectionFocus(scrollPos);
        pending = false;
      });
    }
  });
}

function updateSectionFocus(pos) {
  var readLine = pos + document.documentElement.clientHeight / 4;

  var focusedSection;
  for (var n = numberedSections.length - 1; n >= 0; n--) {
    if (numberedSections[n].offsetTop < readLine) {
      focusedSection = numberedSections[n];
      break;
    }
  }

  var secid = focusedSection && focusedSection.getAttribute('secid');
  if (secid !== currentSection) {
    currentSection && fold(currentSection, false);
    secid && fold(secid, true);
    currentSection = secid;
  }
}

function fold(secid, check) {
  document.getElementById('_sidebar_' + secid).className = check ? 'viewing' : '';
  var sections = secid.split('.');
  while (sections.length) {
    var toggle = document.getElementById('_toggle_' + sections.join('.'));
    if (toggle) {
      toggle.checked = check;
    }
    sections.pop();
  }
}

updateSectionFocus(window.scrollY);
