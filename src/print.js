var hljs = require('highlight.js');
var visit = require('./visit');

var options;

function print(ast, _options) {
  options = _options || {};
  if (!options.highlight) {
    options.highlight = highlight;
  }
  adornAnchors(ast);
  return (
    '<!DOCTYPE html><html xmlns:spec="http://leebyron.github.io/spec-md/">' +
      '<head>' + printHead(ast) + '</head>' +
      '<body>' + printBody(ast) + '</body>' +
    '</html>'
  );
};

module.exports = print;

function highlight(code, lang) {
  return lang ? hljs.highlight(lang, code).value : code;
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

function printBody(ast) {
  return (
    '<header>' +
      printTitle(ast) +
      printTOC(ast) +
    '</header>' +
    printContent(ast)
  );
}

function printTitle(ast) {
  return !ast.title ? '' : (
    '<h1>' + escape(ast.title.value) + '</h1>'
  );
}


function adornAnchors(ast) {
  var anchors = {};
  var conflicts = {};
  var anchorStack = [];
  visit(ast, function (node) {
    if (node.type === 'Section') {
      var anchor = anchorize(node.title);
      if (anchors.hasOwnProperty(anchor)) {
        conflicts[anchor] = true;
      } else {
        anchors[anchor] = true;
      }
    }
  });

  visit(ast, {
    enter: function (node) {
      if (node.type === 'Section') {
        var anchor = anchorize(node.title);
        if (conflicts.hasOwnProperty(anchor)) {
          anchor = anchorStack[anchorStack.length - 1] + '.' + anchor;
        }
        node.anchor = anchor;
        anchorStack.push(anchor);
      }
      if (node.type === 'Algorithm') {
        node.anchor = anchorize(node.name.name) + '()';
      }
      if (node.type === 'Call') {
        node.href = '#' + anchorize(node.name) + '()';
      }
      if (node.type === 'Production') {
        node.anchor = anchorize(node.name.name);
      }
      if (node.type === 'NonTerminal') {
        node.href = '#' + anchorize(node.name);
      }
    },
    leave: function (node) {
      if (node.type === 'Section') {
        anchorStack.pop();
      }
    }
  });
}


// Table of Contents

function printTOC(ast) {
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
            '<a href="#' + node.anchor + '">' +
              '<spec:secnum>' + join(sectionStack, '.') + '</spec:secnum>' +
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
    '<spec:toc><ol>' +
        (intro.length === 0 ? '' : '<li><a href="#intro">Introduction</a></li>') +
        join(items) +
    '</ol></spec:toc>'
  );
}


// Content

function printContent(doc) {
  var intro = doc.contents.filter(function (content) {
    return content.type !== 'Section';
  });
  var sections = doc.contents.filter(function (content) {
    return content.type === 'Section';
  });
  return (
    (intro.length === 0 ? '' :
      '<section id="intro">' + printAll(intro) + '</section>'
    ) +
    printAll(sections)
  );
}

function printAll(list) {
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
        case 'NonTerminal':
          var mods = (
            (node.params ? '[' + node.params.map(function (param) {
              return (
                '<spec:mod' + (param.conditional ? ' conditional' : '') + '>' +
                  param.name +
                '</spec:mod>'
              );
            }).join(', ') + ']' : '') +
            (node.isList ? '<spec:mod list>list</spec:mod>' : '') +
            (node.isOptional ? '<spec:mod optional>opt</spec:mod>' : '')
          );
          node.mods = mods ? '<spec:mods>' + mods + '</spec:mods>' : '';
          node.params = null;
          break;
      }
    },

    leave: function (node) {
      switch (node.type) {
        case 'Section':
          var level = sectionStack.length;
          var secnum = join(sectionStack, '.');
          sectionNumber = sectionStack.pop();
          return (
            '<section id="' + node.anchor + '">' +
              '<h' + level + '>' +
              '<spec:secnum title="link to this section">' +
                '<a href="#' + node.anchor + '">' + secnum + '</a>' +
              '</spec:secnum>' +
              escape(node.title) +
              '</h' + level + '>' +
              join(node.contents) +
            '</section>'
          );

        case 'BlockIns':
          return '<spec:blockins>' + join(node.contents) + '</spec:blockins>';

        case 'BlockDel':
          return '<spec:blockdel>' + join(node.contents) + '</spec:blockdel>';

        case 'Paragraph':
          return '<p>' + join(node.contents) + '</p>';

        case 'Text':
          return formatText(node.value);

        case 'Bold':
          return '<strong>' + join(node.contents) + '</strong>';

        case 'Italic':
          return '<em>' + join(node.contents) + '</em>';

        case 'Note':
          return '<spec:note>' + join(node.contents) + '</spec:note>';

        case 'Todo':
          return '<spec:todo>' + join(node.contents) + '</spec:todo>';

        case 'HTMLTag':
          return node.tag;

        case 'Ins':
          return '<ins>' + join(node.contents) + '</ins>';

        case 'Del':
          return '<del>' + join(node.contents) + '</del>';

        case 'Code':
          return (
            '<pre><code' +
              (node.lang ? ' language="' + node.lang + '"' : '') +
              (node.counter ? ' counter-example' : '') +
            '>' +
              (options.highlight ?
                options.highlight(node.code, node.lang) :
                escapeCode(node.code)) +
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
            '<spec:algo id="' + node.anchor + '">' +
              node.name +
              node.steps +
            '</spec:algo>'
          );

        case 'Call':
          return (
            '<spec:call>' +
              '<a href="' + node.href + '">' + escape(node.name) + '</a>' +
              '(' + join(node.args, ', ') + ')' +
            '</spec:call>'
          );

        case 'Keyword':
          return '<spec:lit keyword>' + node.value + '</spec:lit>';

        case 'StringLiteral':
          return '<spec:lit string>' + node.value + '</spec:lit>';

        case 'Variable':
          return '<var>' + node.name + '</var>';

        case 'Production':
          return (
            '<spec:production id="' + node.anchor + '">' +
              node.name +
              join(node.defs) +
            '</spec:production>'
          );

        case 'RHS':
          return (
            '<spec:rhs>' +
              maybe(node.condition) +
              join(node.tokens) +
            '</spec:rhs>'
          );

        case 'Condition':
          return (
            '<spec:condition' + (node.condition ? ' not' : '') + '>' +
              node.param +
            '</spec:condition>'
          );

        case 'OneOf':
          return '<spec:oneof>' + join(node.tokens) + '</spec:oneof>';

        case 'Prose':
          return '<spec:prose>' + escape(node.text) + '</spec:prose>';

        case 'NonTerminal':
          return (
            '<spec:nt' +
              (node.isList ? ' isList' : '') +
              (node.isOptional ? ' isOptional' : '') +
            '>' +
              '<a href="' + node.href + '">' + escape(node.name) + '</a>' +
              node.mods +
            '</spec:nt>'
          );

        case 'NonTerminalParam':
          return (node.conditional ? '?' : '') + node.name;

        case 'Constrained':
          return (
            '<spec:constrained>' +
              node.token +
              node.constraint +
            '</spec:constrained>'
          );

        case 'ButNot':
          return '<spec:butnot>' + node.token + '</spec:butnot>';

        case 'RegExp':
          return '<spec:rx>' + escape(node.value) + '</spec:rx>';

        case 'Terminal':
          return '<spec:t>' + escape(node.value) + '</spec:t>';

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
  return title.toLowerCase().replace(/[^a-z]+/g, '-');
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
    .replace(/\\([\\`*_{}[\]()#+\-!])/, '$1')
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
    .replace(/"([^"]+)"/g, '\u201C$1\u201D')
    .replace(/(\w)'(?=\w)/g, '$1\u2019')
    .replace(/'([^']+)'/g, '\u2018$1\u2019')
  );
}
