var hljs = require('highlight.js');
var visit = require('./visit');

function print(ast, _options) {
  var options = {};
  options.highlight = _options && _options.highlight || highlight;
  options.biblio = _options && _options.biblio && buildBiblio(_options.biblio) || {};
  validateSecIDs(ast, options);
  assignBiblioIDs(ast, options);
  return (
    '<!DOCTYPE html><html>' +
      '<!-- Built with spec-md -->' +
      '<head>' + printHead(ast) + '</head>' +
      '<body>' + printBody(ast, options) + '</body>' +
    '</html>'
  );
};

module.exports = print;

function highlight(code, lang) {
  try {
    return lang ? hljs.highlight(lang, code).value : escapeCode(code);
  } catch (error) {
    return escapeCode(code);
  }
}

function printHead(ast) {
  return (
    '<meta charset="utf-8">' +
    '<title>' + (ast.title ? ast.title.value : 'Spec') + '</title>' +
    '<link href="spec.css" rel="stylesheet">' +
    '<link href="highlight.css" rel="stylesheet">'
  );
}

function printBody(ast, options) {
  return (
    '<header>' +
      printTitle(ast) +
      printIntro(ast, options) +
      printTOC(ast, options) +
    '</header>' +
    printContent(ast, options) +
    '<footer>' +
      'Written in <a href="http://leebyron.com/spec-md/" target="_blank">Spec Markdown</a>.' +
    '</footer>' +
    printSidebar(ast, options)
  );
}

function printTitle(ast) {
  return !ast.title ? '' : (
    '<h1>' + escape(ast.title.value) + '</h1>'
  );
}

function buildBiblio(ref) {
  var biblio = {};
  Object.keys(ref).forEach(function (site) {
    Object.keys(ref[site]).forEach(function (id) {
      biblio[id] = site + ref[site][id];
    });
  });
  return biblio;
}

function validateSecIDs(ast, options) {
  var sectionIDPart = 0;
  var sectionIDStack = [];

  var items = visit(ast, {
    enter: function (node) {
      if (node.type === 'Section') {
        if (node.secID) {
          var nextIDPart = node.secID[node.secID.length - 1];
          var nextIsLetter = IS_LETTER_RX.test(nextIDPart);
          if (nextIDPart === '*') {
            throw new Error('Not yet supported');
          } else if (!nextIsLetter) {
            nextIDPart = parseInt(nextIDPart, 10);
          }
          if (!nextIsLetter && IS_LETTER_RX.test(sectionIDPart)) {
            throw new Error(
              'Cannot change to numbered section ' + nextIDPart +
              ' after lettered section ' + sectionIDPart
            );
          } else if (!nextIsLetter && nextIDPart <= sectionIDPart) {
            throw new Error(
              'Cannot change to section number ' + nextIDPart +
              ' which would be earlier than ' + nextSecID(sectionIDPart)
            );
          }
          sectionIDPart = nextIDPart;
        } else {
          sectionIDPart = nextSecID(sectionIDPart);
        }
        sectionIDStack.push(sectionIDPart);
        sectionIDPart = 0;
        // Copy the validatd secID stack at this point.
        node.secID = sectionIDStack.slice();
      }
    },
    leave: function (node) {
      if (node.type === 'Section') {
        sectionIDPart = sectionIDStack.pop();
      }
      return '';
    }
  });
}

function assignBiblioIDs(ast, options) {
  var secnames = {};
  var conflicts = {};
  var secnameStack = [];
  visit(ast, function (node) {
    if (node.type === 'Section') {
      var secname = anchorize(node.title);
      if (secnames.hasOwnProperty(secname)) {
        conflicts[secname] = true;
      } else {
        secnames[secname] = true;
      }
    }
  });

  visit(ast, {
    enter: function (node) {
      if (node.type === 'Section') {
        var secname = anchorize(node.title);
        if (conflicts.hasOwnProperty(secname)) {
          secname = secnameStack[secnameStack.length - 1] + '.' + secname;
        }
        var id = 'sec-' + secname;
        if (!options.biblio[id]) {
          options.biblio[id] = '#' + id;
        }
        node.id = id;
        secnameStack.push(secname);
      }
      if (node.type === 'Algorithm') {
        var id = anchorize(node.call.name) + '()';
        if (!options.biblio[id]) {
          options.biblio[id] = '#' + id;
        }
        node.id = id;
      }
      if (node.type === 'Production' || node.type === 'OneOfProduction') {
        var id = anchorize(node.token.name);
        if (!options.biblio[id]) {
          options.biblio[id] = '#' + id;
        }
        node.id = id;
      }
    },
    leave: function (node) {
      if (node.type === 'Section') {
        secnameStack.pop();
      }
    }
  });
}

var IS_LETTER_RX = /^[A-Z]+$/;

function nextSecID(id) {
  var isLetter = IS_LETTER_RX.test(id);
  if (!isLetter) {
    return id + 1;
  }

  // A -> B, Z -> AA, AA -> AB, ZZ -> AAA
  var letters = id.split('');
  var numB26 = '1' + letters.map(function (ch) {
    return (ch.charCodeAt(0) - 65).toString(26);
  }).join('');
  var nextDigitsB26 = (parseInt(numB26, 26) + 1).toString(26).split('');
  return nextDigitsB26.map(function (digit, index) {
    if (index === 0) return digit === '1' ? '' : 'A';
    return String.fromCharCode(parseInt(digit, 26) + 65);
  }).join('');
}


// Table of Contents

function printTOC(ast, options) {
  var sections = ast.contents.filter(function (content) {
    return content.type === 'Section';
  });

  var items = visit(sections, {
    leave: function (node) {
      if (node.type === 'Section') {
        var subSections = join(node.contents);
        var secID = join(node.secID, '.');
        return (
          '<li>' +
            '<a href="' + options.biblio[node.id] + '">' +
              '<span class="spec-secid">' + secID + '</span>' +
              escape(node.title) +
            '</a>' +
            (subSections &&
              '<input hidden class="toggle" type="checkbox" checked id="_toggle_' + secID + '" />' +
              '<label for="_toggle_' + secID + '"></label>' +
              '<ol>' + subSections + '</ol>') +
          '</li>'
        );
      }
      return '';
    }
  });

  return (
    '<div class="spec-toc">' +
      '<div class="title">Contents</div>' +
      '<ol>' + join(items) + '</ol>' +
    '</div>'
  );
}


// Sidebar

function printSidebar(ast, options) {
  var sections = ast.contents.filter(function (content) {
    return content.type === 'Section';
  });

  var items = visit(sections, {
    leave: function (node) {
      if (node.type === 'Section') {
        var subSections = join(node.contents);
        var secID = join(node.secID, '.');
        return (
          '<li id="_sidebar_' + secID + '">' +
            '<a href="' + options.biblio[node.id] + '">' +
              '<span class="spec-secid">' + join(node.secID, '.') + '</span>' +
              escape(node.title) +
            '</a>' +
            (subSections &&
              '<input hidden class="toggle" type="checkbox" id="_sidebar_toggle_' + secID + '" />' +
              '<label for="_sidebar_toggle_' + secID + '"></label>' +
              '<ol>' + subSections + '</ol>') +
          '</li>'
        );
      }
      return '';
    }
  });

  return (
    '<input hidden class="spec-sidebar-toggle" type="checkbox" id="spec-sidebar-toggle" aria-hidden />' +
    '<label for="spec-sidebar-toggle" aria-hidden>&#x2630;</label>' +
    '<div class="spec-sidebar" aria-hidden>' +
      '<div class="spec-toc">' +
        '<div class="title"><a href="#">' + escape(ast.title.value) + '</a></div>' +
        '<ol>' + join(items) + '</ol>' +
      '</div>' +
      '<script>' + SIDEBAR_JS + '</script>' +
    '</div>'
  );
}


// Content

function printIntro(doc, options) {
  var intro = doc.contents.filter(function (content) {
    return content.type !== 'Section';
  });
  return intro.length === 0 ? '' :
    '<section id="intro">' +
      printAll(intro, options) +
    '</section>';
}

function printContent(doc, options) {
  var sections = doc.contents.filter(function (content) {
    return content.type === 'Section';
  });
  return printAll(sections, options);
}

function printAll(list, options) {
  return join(visit(list, {
    leave: function (node) {
      switch (node.type) {
        case 'Section':
          var level = node.secID.length + 1;
          var secID = join(node.secID, '.');
          return (
            '<section id="' + node.id + '" secid="' + secID + '">' +
              '<h' + level + '>' +
              '<span class="spec-secid" title="link to this section">' +
                '<a href="' + options.biblio[node.id] + '">' + secID + '</a>' +
              '</span>' +
              escape(node.title) +
              '</h' + level + '>' +
              join(node.contents) +
            '</section>'
          );

        case 'BlockIns':
          return '<div class="spec-added">' + join(node.contents) + '</div>';

        case 'BlockDel':
          return '<div class="spec-removed">' + join(node.contents) + '</div>';

        case 'Paragraph':
          return '<p>' + join(node.contents) + '</p>';

        case 'Text':
          return formatText(node.value);

        case 'Bold':
          return '<strong>' + join(node.contents) + '</strong>';

        case 'Italic':
          return '<em>' + join(node.contents) + '</em>';

        case 'Note':
          return '<div class="spec-note">' + join(node.contents) + '</div>';

        case 'Todo':
          return '<div class="spec-todo">' + join(node.contents) + '</div>';

        case 'HTMLBlock':
          return node.html;

        case 'HTMLTag':
          return node.tag;

        case 'Ins':
          return '<ins>' + join(node.contents) + '</ins>';

        case 'Del':
          return '<del>' + join(node.contents) + '</del>';

        case 'Code':
          return (
            '<pre' +
              (node.counter ? ' class="spec-counter-example"' : '') +
            '><code>' +
              options.highlight(node.code, node.lang) +
            '</code></pre>'
          );

        case 'InlineCode':
          return '<code>' + escapeCode(node.code) + '</code>';

        case 'Link':
          return '<a href="' + encodeURI(node.url) + '">' + join(node.contents) + '</a>';

        case 'Image':
          return (
            '<img src="' + encodeURI(node.url) + '"' +
              (node.alt ? ' alt="' + escape(node.alt) + '"' : '') +
            '/>'
          );

        case 'List':
          var olul = node.ordered ? 'ol' : 'ul';
          return '<' + olul + '>' + join(node.items) + '</' + olul + '>';

        case 'ListItem':
          return '<li>' + join(node.contents) + '</li>';

        case 'Table':
          return (
            '<table>' +
              '<thead><tr>' +
                join(node.headers.map(function (cell) {
                  return '<th>' + join(cell) + '</th>';
                })) +
              '</tr></thead>' +
              '<tbody>' +
                join(node.rows.map(function (row) {
                  return (
                    '<tr>' +
                      join(row.map(function (cell) {
                        return '<td>' + join(cell) + '</td>';
                      })) +
                    '</tr>'
                  );
                })) +
              '</tbody>' +
            '</table>'
          );

        case 'Algorithm':
          return (
            '<div class="spec-algo" id="' + node.id + '">' +
              node.call +
              node.steps +
            '</div>'
          );

        case 'Call':
          return (
            '<span class="spec-call">' +
              link(node, anchorize(node.name) + '()', options) +
              '(' + join(node.args, ', ') + ')' +
            '</span>'
          );

        case 'Keyword':
          return '<span class="spec-keyword">' + node.value + '</span>';

        case 'StringLiteral':
          return '<span class="spec-string">' + node.value + '</span>';

        case 'Variable':
          return '<var>' + node.name + '</var>';

        case 'Semantic':
          var defType = node.defType === 1 ? '' : ' d' + node.defType;
          return (
            '<div class="spec-semantic' + defType + '">' +
              node.name +
              node.rhs +
              node.steps +
            '</div>'
          );

        case 'Production':
          var defType = node.defType === 1 ? '' : ' d' + node.defType;
          return (
            '<div class="spec-production' + defType + '" id="' + node.id + '">' +
              node.token +
              node.rhs +
            '</div>'
          );

        case 'OneOfRHS':
          return (
            '<div class="spec-oneof">' +
              '<table>' +
                join(node.rows.map(function (row) {
                  return (
                    '<tr>' +
                      join(row.map(function (def) {
                        return '<td class="spec-rhs">' + def + '</td>';
                      })) +
                    '</tr>'
                  );
                })) +
              '</table>' +
            '</div>'
          );

        case 'ListRHS':
          return join(node.defs);

        case 'RHS':
          return (
            '<div class="spec-rhs">' +
              maybe(node.condition) +
              join(node.tokens) +
            '</div>'
          );

        case 'Condition':
          return (
            '<span class="spec-condition' + (node.not ? ' not' : '') + '">' +
              node.param +
            '</span>'
          );

        case 'Prose':
          return '<span class="spec-prose">' + escape(node.text) + '</span>';

        case 'NonTerminal':
          var mods = (
            (node.params ? '<span class="spec-params">' + join(node.params) + '</span>' : '') +
            (node.isList ? '<span class="spec-mod list">list</span>' : '') +
            (node.isOptional ? '<span class="spec-mod optional">opt</span>' : '')
          );
          return (
            '<span class="spec-nt' +
              (node.isList ? ' list' : '') +
              (node.isOptional ? ' optional' : '') +
            '">' +
              link(node, anchorize(node.name), options) +
              (mods ? '<span class="spec-mods">' + mods + '</span>' : '') +
            '</span>'
          );

        case 'NonTerminalParam':
          return (
            '<span class="spec-param' + (node.conditional ? ' conditional' : '') + '">' +
              node.name +
            '</span>'
          );

        case 'Constrained':
          return (
            '<span class="spec-constrained">' +
              node.token +
              node.constraint +
            '</span>'
          );

        case 'Empty':
          return '<span class="spec-empty">[empty]</span>';

        case 'Lookahead':
          return (
            '<span class="spec-lookahead'+
              (node.set.length > 1 ? ' set' : '') +
              (node.not ? ' not' : '') +
            '">'+
              join(node.set) +
            '</span>'
          );

        case 'ButNot':
          return '<span class="spec-butnot">' + join(node.tokens) + '</span>';

        case 'RegExp':
          return '<span class="spec-rx">' + escape(node.value) + '</span>';

        case 'Terminal':
          return '<span class="spec-t">' + escape(node.value) + '</span>';

        default:
          throw new Error('Unknown AST node: ' + node.type + ' ' + node);
      }

    }
  }));
}

function join(list, joiner) {
  return list ? list.filter(function (x) { return !!x }).join(joiner || '') : '';
}

function maybe(value) {
  return value ? value : '';
}

function link(node, id, options) {
  var href = options.biblio[id];
  var content = escape(node.name);
  if (!href) {
    return content;
  }
  return (
    '<a href="' + href + '"' +
      (href[0] !== '#' ? ' target="_blank"' : '') + '>' +
      content +
    '</a>'
  );
}

function anchorize(title) {
  return title.replace(/[^A-Za-z0-9\-_]+/g, '-');
}

var ESCAPE_CODE_REGEX = /[><"'&]/g;
var ESCAPE_REGEX = /\u2010|\u2013|\u2014|\u2018|\u2019|\u201C|\u201D|\u2190|\u2192|\u2194|\u21D0|\u21D2|\u21D4|\u2245|\u2264|\u2265|[><"']|(?:&(?!\S{1,10};))/g;

var ESCAPE_LOOKUP = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '\u2010': '&#8208;',
  '\u2013': '&ndash;',
  '\u2014': '&mdash;',
  '\u2018': '&lsquo;',
  '\u2019': '&rsquo;',
  '\u201C': '&ldquo;',
  '\u201D': '&rdquo;',
  '\u2190': '&larr;',
  '\u2192': '&rarr;',
  '\u2194': '&harr;',
  '\u21D0': '&lArr;',
  '\u21D2': '&rArr;',
  '\u21D4': '&hArr;',
  '\u2245': '&cong;',
  '\u2264': '&le;',
  '\u2265': '&ge;',
};

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

function escapeCode(text) {
  return text.replace(ESCAPE_CODE_REGEX, escaper);
}

function escape(text) {
  return text.replace(ESCAPE_REGEX, escaper);
}

function formatText(text) {
  return escape(text
    .replace(/\\([\\`*_{}[\]()<>#+\-!|])/g, '$1')
    .replace(/[ \n\r]+/g, ' ')
    .replace(/<-+>/g, '\u2194')
    .replace(/<-+/g, '\u2190')
    .replace(/-+>/g, '\u2192')
    .replace(/<=+>/g, '\u21D4')
    .replace(/<==+/g, '\u21D0')
    .replace(/=+>/g, '\u21D2')
    .replace(/~=/g, '\u2245')
    .replace(/<=/g, '\u2264')
    .replace(/>=/g, '\u2265')
    .replace(/(\w)--(?=\w)/g, '$1\u2014')
    .replace(/(\w)-(?=\w)/g, '$1\u2010')
    .replace(/(\S\s)-(?=\s\S)/g, '$1\u2013')
    .replace(/(\s)"/g, '$1\u201C')
    .replace(/"(?=\w)/g, '\u201C')
    .replace(/"/g, '\u201D')
    .replace(/(\w)'(?=\w)/g, '$1\u2019')
    .replace(/(\s)'/g, '\u2018')
    .replace(/'(?=\w)/g, '\u2018')
    .replace(/'/g, '\u2019')
  );
}

var SIDEBAR_JS = `
(function () {
var currentSection;
var numberedSections = [];

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
    var toggle = document.getElementById('_sidebar_toggle_' + sections.join('.'));
    if (toggle) {
      toggle.checked = check;
    }
    sections.pop();
  }
}

updateSectionFocus(window.scrollY);
})();`;
