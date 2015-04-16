var hljs = require('highlight.js');
var visit = require('./visit');

var options;

function print(ast, _options) {
  options = _options || {};
  if (!options.highlight) {
    options.highlight = highlight;
  }
  var biblio = createBiblioIDs(ast);
  return (
    '<!DOCTYPE html><html>' +
      '<!-- Built with spec-md -->' +
      '<head>' + printHead(ast) + '</head>' +
      '<body>' + printBody(ast, biblio) + '</body>' +
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

var sectionNumber;
var sectionStack;

function printBody(ast, biblio) {
  return (
    '<header>' +
      printTitle(ast) +
      printTOC(ast, biblio) +
    '</header>' +
    printContent(ast, biblio) +
    '<footer>' +
      'Written in <a href="http://leebyron.com/spec-md/" target="_blank">Spec Markdown</a>.' +
    '</footer>'
  );
}

function printTitle(ast) {
  return !ast.title ? '' : (
    '<h1>' + escape(ast.title.value) + '</h1>'
  );
}


function createBiblioIDs(ast) {
  var biblio = {};

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
        if (!biblio[id]) {
          biblio[id] = '#' + id;
        }
        node.id = id;
        secnameStack.push(secname);
      }
      if (node.type === 'Algorithm') {
        var id = anchorize(node.name.name) + '()';
        if (!biblio[id]) {
          biblio[id] = '#' + id;
        }
        node.id = id;
      }
      if (node.type === 'Production' || node.type === 'OneOfProduction') {
        var id = anchorize(node.name.name);
        if (!biblio[id]) {
          biblio[id] = '#' + id;
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

  return biblio;
}


// Table of Contents

function printTOC(ast, biblio) {
  var sectionNumber = 0;
  var sectionStack = [];

  var intro = ast.contents.filter(function (content) {
    return content.type !== 'Section';
  });
  var sections = ast.contents.filter(function (content) {
    return content.type === 'Section';
  });

  var items = visit(sections, {
    enter: function (node) {
      if (node.type === 'Section') {
        if (node.secnum) {
          var nextNum = node.secnum.split('.').pop();
          if (nextNum === '*') {
            throw new Error('Not yet supported');
          }
          nextNum = parseInt(nextNum, 10);
          if (nextNum <= sectionNumber) {
            throw new Error(
              'Cannot change to section number ' + nextNum +
              ' which would be earlier than ' + (sectionNumber+1)
            );
          }
          sectionNumber = nextNum;
        } else {
          sectionNumber++;
        }
        sectionStack.push(sectionNumber);
        sectionNumber = 0;
      }
    },
    leave: function (node) {
      if (node.type === 'Section') {
        var subSections = join(node.contents);
        var printed = (
          '<li>' +
            '<a href="' + biblio[node.id] + '">' +
              '<span class="spec-secnum">' + join(sectionStack, '.') + '</span>' +
              escape(node.title) +
            '</a>' +
            (subSections ? '<ol>' + subSections + '</ol>' : subSections) +
          '</li>'
        );
        sectionNumber = sectionStack.pop();
        return printed;
      }
      return '';
    }
  });

  return (
    '<div class="spec-toc"><ol>' +
        (intro.length === 0 ? '' : '<li><a href="#intro">Introduction</a></li>') +
        join(items) +
    '</ol></div>'
  );
}


// Content

function printContent(doc, biblio) {
  var intro = doc.contents.filter(function (content) {
    return content.type !== 'Section';
  });
  var sections = doc.contents.filter(function (content) {
    return content.type === 'Section';
  });
  return (
    (intro.length === 0 ? '' :
      '<section id="intro">' +
        '<h2>Introduction</h2>' +
        printAll(intro, biblio) +
      '</section>'
    ) +
    printAll(sections, biblio)
  );
}

function printAll(list, biblio) {
  var sectionNumber = 0;
  var sectionStack = [];

  return join(visit(list, {
    enter: function (node) {
      switch (node.type) {
        case 'Section':
          if (node.secnum) {
            var nextNum = node.secnum.split('.').pop();
            if (nextNum === '*') {
              throw new Error('Not yet supported');
            }
            nextNum = parseInt(nextNum, 10);
            if (nextNum <= sectionNumber) {
              throw new Error(
                'Cannot change to section number ' + nextNum +
                ' which would be earlier than ' + (sectionNumber+1)
              );
            }
            sectionNumber = nextNum;
          } else {
            sectionNumber++;
          }
          sectionStack.push(sectionNumber);
          sectionNumber = 0;
          break;
      }
    },

    leave: function (node) {
      switch (node.type) {
        case 'Section':
          var level = sectionStack.length + 1;
          var secnum = join(sectionStack, '.');
          sectionNumber = sectionStack.pop();
          return (
            '<section id="' + node.id + '">' +
              '<h' + level + '>' +
              '<span class="spec-secnum" title="link to this section">' +
                '<a href="' + biblio[node.id] + '">' + secnum + '</a>' +
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
              node.name +
              node.steps +
            '</div>'
          );

        case 'Call':
          var id = anchorize(node.name) + '()';
          var href = biblio[id];
          return (
            '<span class="spec-call">' +
              (href ? '<a href="' + href + '">' : '') +
                escape(node.name) +
              (href ? '</a>' : '') +
              '(' + join(node.args, ', ') + ')' +
            '</span>'
          );

        case 'Keyword':
          return '<span class="spec-keyword">' + node.value + '</span>';

        case 'StringLiteral':
          return '<span class="spec-string">' + node.value + '</span>';

        case 'Variable':
          return '<var>' + node.name + '</var>';

        case 'Production':
          return (
            '<div class="spec-production" id="' + node.id + '">' +
              node.name +
              join(node.defs) +
            '</div>'
          );

        case 'OneOfProduction':
          return (
            '<div class="spec-production oneof" id="' + node.id + '">' +
              node.name +
              '<table>' +
                join(node.defs.map(function (defRow) {
                  return (
                    '<tr>' +
                      join(defRow.map(function (def) {
                        return '<td class="spec-rhs">' + def + '</td>';
                      })) +
                    '</tr>'
                  );
                })) +
              '</table>' +
            '</div>'
          );

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
          var id = anchorize(node.name);
          var href = biblio[id];
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
              (href ? '<a href="' + href + '">' : '') +
                escape(node.name) +
              (href ? '</a>' : '') +
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
    .replace('"', '\u201D')
    .replace(/(\w)'(?=\w)/g, '$1\u2019')
    .replace(/(\s)'/g, '\u2018')
    .replace(/'(?=\w)/g, '\u2018')
    .replace("'", '\u2019')
  );
}
