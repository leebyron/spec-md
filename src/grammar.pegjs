{
  var indentStack = [];
  var indent = 0;

  function orderify(list) {
    list.ordered = true;
    list.items.forEach(function (item) {
      if (item.contents[item.contents.length - 1].type === 'List') {
        orderify(item.contents[item.contents.length - 1]);
      }
    });
    return list;
  }

  var htmlBlockName;

  var BLOCK_TAGS_RX = /^(?:p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)$/i;
}

// Document

document = title:title? contents:documentContent* EOF {
  return {
    type: 'Document',
    title: title,
    contents: contents
  };
}

title = BLOCK !'#' value:$NOT_NL+ NL ('---' '-'* / '===' '='*) &NL {
  return {
    type: 'DocumentTitle',
    value: value
  };
}

SEC_CLOSE = _ '#'* &NL

sectionTitle = $titleChar+
titleChar = [^\n\r# ] / [# ] titleChar

sectionID = start:$sectionIDStart rest:('.' $sectionIDPart)* '.' {
  return [start].concat(rest.map(function (nodes) {
    return nodes[1];
  }));
}
sectionIDStart = [0-9]+ / [A-Z]+ / '*'
sectionIDPart = [0-9]+ / '*'

section1 = BLOCK '#' !'#' _ secID:sectionID? _ title:sectionTitle SEC_CLOSE contents:section1Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section2 = BLOCK '##' !'#' _ secID:sectionID? _ title:sectionTitle SEC_CLOSE contents:section2Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section3 = BLOCK '###' !'#' _ secID:sectionID? _ title:sectionTitle SEC_CLOSE contents:section3Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section4 = BLOCK '####' !'#' _ secID:sectionID? _ title:sectionTitle SEC_CLOSE contents:section4Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section5 = BLOCK '#####' !'#' _ secID:sectionID? _ title:sectionTitle SEC_CLOSE contents:section5Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

documentContent = import1 / section1 / importRel / sectionContent
section1Content = import2 / section2 / importRel / sectionContent
section2Content = import3 / section3 / importRel / sectionContent
section3Content = import4 / section4 / importRel / sectionContent
section4Content = import5 / section5 / importRel / sectionContent
section5Content = importRel / sectionContent

sectionContent = note
               / todo
               / indentCode
               / blockCode
               / algorithm
               / semantic
               / production
               / table
               / list
               / blockEdit
               / htmlBlock
               / paragraph


// Import

importLink = link:link &( BLOCK / EOF ) &{
  return link.url.slice(-3) === '.md' && !/^\/([a-z]*:\/\/)/.test(link.url);
} {
  return {
    type: 'Import',
    path: link.url
  };
}

importRel = BLOCK importLink:importLink &NL { return importLink; }
import1 = BLOCK '#' _ importLink:importLink SEC_CLOSE { return importLink; }
import2 = BLOCK '##' _ importLink:importLink SEC_CLOSE { return importLink; }
import3 = BLOCK '###' _ importLink:importLink SEC_CLOSE { return importLink; }
import4 = BLOCK '####' _ importLink:importLink SEC_CLOSE { return importLink; }
import5 = BLOCK '#####' _ importLink:importLink SEC_CLOSE { return importLink; }


// Block Edit

blockEdit = blockIns / blockDel

blockIns = BLOCK '{++' &BLOCK contents:sectionContent* BLOCK '++}' &(BLOCK / EOF) {
  return {
    type: 'BlockIns',
    contents: contents
  };
}

blockDel = BLOCK '{--' &BLOCK contents:sectionContent* BLOCK '--}' &(BLOCK / EOF) {
  return {
    type: 'BlockDel',
    contents: contents
  };
}


// HTML Block

htmlBlock = BLOCK html:$(
  name:tagOpen &{
    if (BLOCK_TAGS_RX.test(name)) {
      htmlBlockName = name;
      return true;
    }
  }
  htmlContent*
  close:tagClose &{ return htmlBlockName === close; }
) {
  return {
    type: 'HTMLBlock',
    name: htmlBlockName,
    html: html
  };
}

htmlContent = [^<]+
            / inner:tagOpen &{ return htmlBlockName === inner; }
              htmlContent*
              close:tagClose &{ return htmlBlockName === close; }
            / open:tagOpen &{ return htmlBlockName !== open; }
            / close:tagClose &{ return htmlBlockName !== close; }
            / !tagClose '<'

tagOpen = '<' name:$[a-z]+ $[^>]* '>' { return name; }
tagClose = '</' name:$[a-z]+ '>' { return name; }


// Paragraph

paragraph = BLOCK !'#' contents:content+ {
  return {
    type: 'Paragraph',
    contents: contents
  };
}

escaped  = '\\' [\\`*_{}[\]()#+\-.!<>|]
inlineEntity = inlineEdit / inlineCode / reference / bold / italic / link / image / htmlTag

content = inlineEntity / text

textChar = escaped
         / [^\n\r+\-{`*[!<]
         / '++' !'}'
         / '+' !'+}'
         / '--' !'}'
         / '-' !'-}'
         / !image '!'
         / !htmlTag '<'
         / NL !(NL / ' '* listBullet)

text = value:$textChar+ {
  return {
    type: 'Text',
    value: value
  };
}

note = BLOCK 'NOTE'i (':' / ' ') _ contents:content* {
  return {
    type: 'Note',
    contents: contents
  };
}

todo = BLOCK ('TODO'i / 'TK'i) (':' / ' ') _ contents:content* {
  return {
    type: 'Todo',
    contents: contents
  };
}

bold = '**' contents:(inlineCode / link / italic / text)+ '**' {
  return {
    type: 'Bold',
    contents: contents
  };
}

italic = '*' contents:(inlineCode / link / text)+ '*' {
  return {
    type: 'Italic',
    contents: contents
  };
}

inlineEdit = ins / del

ins = '{++' contents:content* '++}' {
  return {
    type: 'Ins',
    contents: contents
  };
}

del = '{--' contents:content* '--}' {
  return {
    type: 'Del',
    contents: contents
  };
}

htmlTag = tag:$('<' '/'? [a-z]+ [^>]* '>') {
  return {
    type: 'HTMLTag',
    tag: tag
  };
}

reference = '{' !('++'/'--') _ ref:(call / value / token)? _ close:'}'? {
  if (ref === null || close === null) {
    error('Malformed {reference}.');
  }
  return ref;
}

inlineCode = '`' code:$[^`\n\r]+ '`' {
  return {
    type: 'InlineCode',
    code: code
  };
}

blockCode = BLOCK '```' counter:'!'? lang:($NOT_NL+)? NL code:$([^`] / '`' [^`] / '``' [^`])+ '```' {
  // dedent codeblock by current indent level?
  return {
    type: 'Code',
    counter: counter !== null,
    lang: lang,
    code: code
  };
}

indentCode = DEEP_INDENT code:(indentCodeLine+)? DEDENT &{ return code !== null } {
  return {
    type: 'Code',
    code: code.join('\n')
  };
}

indentCodeLine = depth:LINE code:$NOT_NL+ {
  return Array(depth - indent + 1).join(' ') + code;
}


// Link & Image

link = '[' contents:linkContent* '](' _ url:$[^)]+ _ ')' {
  return {
    type: 'Link',
    contents: contents,
    url: url
  };
}

linkContent = inlineEntity / linkText

linkTextChar = escaped
             / [^\]\n\r+\-{`*!<]
             / '++' !'}'
             / '+' !'+}'
             / '--' !'}'
             / '-' !'-}'
             / !image '!'
             / !htmlTag '<'

linkText = value:$linkTextChar+ {
  return {
    type: 'Text',
    value: value
  };
}

image = '![' alt:$[^\]]+ '](' _ url:$[^)]+ _ ')' {
  return {
    type: 'Image',
    alt: alt,
    url: url
  };
}


// List

list = indentedList / unorderedList / orderedList

indentedList = INDENT list:(unorderedList / orderedList)? DEDENT &{ return list !== null; } {
  return list;
}

unorderedList = &(LINE unorderedBullet) items:listItem+ {
  return {
    type: 'List',
    ordered: false,
    items: items
  };
}

orderedList = &(LINE orderedBullet) items:listItem+ {
  return {
    type: 'List',
    ordered: true,
    items: items
  };
}

listItem = LINE bullet:listBullet _ contents:content* sublist:indentedList? {
  return {
    type: 'ListItem',
    contents: sublist ? contents.concat([sublist]) : contents
  };
}

listBullet = unorderedBullet / orderedBullet
unorderedBullet = $(('-' / '+' / '*') ' ')
orderedBullet = $(([1-9]+ '.') ' ')


// Table

table = BLOCK !'#' ('|' _)? headers:tableCells _ '|'? LINE [ -|]+ rows:tableRow+ {
  return {
    type: 'Table',
    headers: headers,
    rows: rows
  };
}

tableRow = LINE !'#' ('|' _)? cells:tableCells _ '|'? {
  return cells;
}

tableCells = first:tableCell rest:(_ '|' _ tableCell)+ {
  return [first].concat(rest.map(function (nodes) {
    return nodes[3];
  }));
}

tableCell = contents:tableCellContent+ {
  return contents;
}

tableCellContent = inlineEntity / tableCellText

tableCellTextChar = escaped
                  / [^|\n\r+\-{`*[!<]
                  / '++' !'}'
                  / '+' !'+}'
                  / '--' !'}'
                  / '-' !'-}'
                  / !image '!'
                  / !htmlTag '<'

tableCellText = value:$tableCellTextChar+ {
  return {
    type: 'Text',
    value: value
  };
}


// Names

localName = $([_a-z][_a-zA-Z0-9]*)
globalName = $([A-Z][_a-zA-Z]*)
paramName = $([_a-zA-Z][_a-zA-Z0-9]*)


// Algorithm

algorithm = BLOCK call:call _ ':' ':'? steps:list {
  return {
    type: 'Algorithm',
    call: call,
    steps: orderify(steps)
  };
}

call = name:(globalName / localName) '(' _ args:callArg* _ ')' {
  return {
    type: 'Call',
    name: name,
    args: args
  };
}

callArg = value:value [, ]* {
  return value;
}

value = stringLiteral / keyword / variable

stringLiteral = '"' value:$([^"\n\r]/'\\"')* closer:'"'? {
  if (closer === null) {
    error('Unclosed string literal.');
  }
  return {
    type: 'StringLiteral',
    value: '"' + value + '"'
  };
}

keyword = value:$('null' / 'true' / 'false' / 'undefined') ![a-zA-Z] {
  return {
    type: 'Keyword',
    value: value
  };
}

variable = name:localName {
  return {
    type: 'Variable',
    name: name
  };
}


// Grammar productions

semantic = BLOCK name:nonTerminal _ defType:(':::'/'::'/':') _ tokens:token+ steps:list {
  return {
    type: 'Semantic',
    name: name,
    defType: defType.length,
    rhs: {
      type: 'RHS',
      tokens: tokens
    },
    steps: orderify(steps)
  };
}

production = BLOCK token:nonTerminal _ defType:(':::'/'::'/':') _ rhs:productionRHS {
  return {
    type: 'Production',
    token: token,
    defType: defType.length,
    rhs: rhs
  };
}

productionRHS = oneOfRHS / singleRHS / listRHS

oneOfRHS = 'one of' rows:(_ NL? (_ token)+)+ {
  return {
    type: 'OneOfRHS',
    rows: rows.map(function (row) {
      return row[2].map(function (tokens) {
        return tokens[1];
      });
    })
  };
}

singleRHS = condition:condition? _ tokens:token+ {
  return {
    type: 'RHS',
    condition: condition,
    tokens: tokens
  };
}

listRHS = defs:(indentedRHS / listItemRHS+) {
  return { type: 'ListRHS', defs: defs };
}

indentedRHS = INDENT defs:(listItemRHS+)? DEDENT &{ return defs !== null; } {
  return defs;
}

listItemRHS = LINE listBullet _ condition:condition? _ tokens:token+ {
  return {
    type: 'RHS',
    condition: condition,
    tokens: tokens
  };
}

condition = '[' condition:('+' / '~') param:paramName ']' {
  return {
    type: 'Condition',
    param: param,
    not: condition === '~'
  };
}

token = token:(prose / emptyToken / lookahead / nonTerminal / regexp / quotedTerminal / terminal) _ constraint:constraint? _ {
  return !constraint ? token : {
    type: 'Constrained',
    token: token,
    constraint: constraint
  };
}

prose = '"' text:$([^"\n\r]/'\\"')* closer:'"'? {
  if (closer === null) {
    error('Unclosed quoted prose.');
  }
  return {
    type: 'Prose',
    text: text
  };
}

emptyToken = '[' _ 'empty' _ ']' {
  return {
    type: 'Empty'
  };
}

lookahead = '[' _ 'lookahead' _ not:('!=' / '!')? _ set:(lookaheadSet/lookaheadItem)? _ closer:']' {
  if (set === null) {
    error('Malformed lookahead. Did you forget tokens?');
  }
  return {
    type: 'Lookahead',
    not: not !== null,
    set: set
  };
}

lookaheadSet = '{' set:((_ !'}' token _ ','?)+)? _ closer:'}'? {
  if (set === null || closer === null) {
    error('Malformed lookahead set. Did you forget tokens?');
  }
  return set.map(function (nodes) { return nodes[2]; });
}

lookaheadItem = !']' token:token {
  return [token];
}

nonTerminal = name:globalName params:nonTerminalParams? quantifier:('+' / '?' / '*')? {
  return {
    type: 'NonTerminal',
    name: name,
    params: params,
    isList: quantifier === '+' || quantifier === '*',
    isOptional: quantifier === '?' || quantifier === '*'
  };
}

nonTerminalParams = '[' _ params:(nonTerminalParam+)? _ closer:']'? {
  if (params === null || closer === null) {
    error('Malformed terminal params.');
  }
  return params;
}

nonTerminalParam = conditional:'?'? name:paramName $[, ]* {
  return {
    type: 'NonTerminalParam',
    conditional: conditional === '?',
    name: name
  };
}

constraint = butNot

butNot = 'but not ' _ 'one of '? _ first:token rest:(_ ('or '/',') _ token)* {
  return {
    type: 'ButNot',
    tokens: [first].concat(rest.map(function (nodes) {
      return nodes[3];
    }))
  };
}

regexp = '/' value:$(([^/\n] / '\\/')+)? closer:'/'? {
  if (value === null || closer === null) {
    error('Malformed regular expression.');
  }
  return {
    type: 'RegExp',
    value: '/' + value + '/'
  };
}

quotedTerminal = '`' value:$(([^`\n] / ('\\`'))+)? closer:'`' {
  if (value === null || closer === null) {
    error('Malformed quoted terminal');
  }
  return {
    type: 'Terminal',
    value: value
  };
}

terminal = value:$(([^ \n"/`] [^ \n"\`,\]\}]*)) {
  return {
    type: 'Terminal',
    value: value
  };
}


// Lines and Indentation

INDENT = &( lineStart depth:indentDepth &{ return depth >= indent + 2; } {
  indentStack.push(indent);
  indent = depth;
})

DEEP_INDENT = &( lineStart depth:indentDepth &{ return depth >= indent + 4; } {
  indentStack.push(indent);
  indent = depth;
})

BLOCK = blockStart depth:indentDepth &{ return depth === indent || depth === indent + 1; } {
  return depth;
}

LINE = lineStart depth:indentDepth &{ return depth >= indent; } {
  return depth;
}

DEDENT = &lineStart !{ indentStack.length === 0 } {
  indent = indentStack.pop();
}

NL = '\n' / '\r' / '\r\n'
NOT_NL = [^\n\r]
_ = ' '*
EOF = NL* !.

lineStart = NL+ / & { return offset() === 0 }

blockStart = (NL NL+) / & { return offset() === 0 }

indentDepth = sp:$' '* { return sp.length; }
