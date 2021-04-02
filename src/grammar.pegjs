{
  let indentStack = [];
  let indent = 0;

  function orderify(list) {
    list.ordered = true;
    for (const item of list.items) {
      if (item.contents[item.contents.length - 1].type === 'List') {
        orderify(item.contents[item.contents.length - 1]);
      }
    }
    return list;
  }

  function unescape(text) {
    // Any ASCII punctuation character may be backslash-escaped
    return text.replace(/\\([\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E])/g, '$1');
  }

  let htmlBlockName;

  const BLOCK_TAGS_RX = /^(?:p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)$/i;
}

// Document

initialDocument = title:title contents:documentContent* EOF {
  return {
    type: 'Document',
    title: title,
    contents: contents
  };
}

importedDocument = contents:documentContent* EOF {
  return {
    type: 'Document',
    contents: contents
  };
}

title = setextTitle / markdownTitle

setextTitle = BLOCK !'#' value:$NOT_NL+ NL ('---' '-'* / '===' '='*) &NL {
  return {
    type: 'DocumentTitle',
    value: unescape(value)
  };
}

markdownTitle = BLOCK H1 value:headerText H_END {
  return {
    type: 'DocumentTitle',
    value: value
  };
}

H1 = '#' !'#' _
H2 = '##' !'#' _
H3 = '###' !'#' _
H4 = '####' !'#' _
H5 = '#####' !'#' _
H6 = '######' !'#' _
H_END = _ '#'* &NL
headerText = text:$headerChar+ {
  return unescape(text);
}
headerChar = [^\n\r# ] / [# ] headerChar

sectionID = start:$sectionIDStart rest:('.' $sectionIDPart)* '.' {
  return [start].concat(rest.map(function (nodes) {
    return nodes[1];
  }));
}
sectionIDStart = [0-9]+ / [A-Z]+ / '*'
sectionIDPart = [0-9]+ / '*'

section1 = BLOCK H1 secID:sectionID? _ title:headerText H_END contents:section1Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section2 = BLOCK H2 secID:sectionID? _ title:headerText H_END contents:section2Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section3 = BLOCK H3 secID:sectionID? _ title:headerText H_END contents:section3Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section4 = BLOCK H4 secID:sectionID? _ title:headerText H_END contents:section4Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section5 = BLOCK H5 secID:sectionID? _ title:headerText H_END contents:section5Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

section6 = BLOCK H6 secID:sectionID? _ title:headerText H_END contents:section6Content* {
  return {
    type: 'Section',
    secID: secID,
    title: title,
    contents: contents
  };
}

subsectionHeader = '**' title:$[^\n\r*]+ '**' &BLOCK {
  return unescape(title);
}

subsection = BLOCK title:subsectionHeader contents:sectionContent* {
  return {
    type: 'Subsection',
    title: title,
    contents: contents,
  }
}

documentContent = import1 / section1 / subsection / importRel / sectionContent
section1Content = import2 / section2 / subsection / importRel / sectionContent
section2Content = import3 / section3 / subsection / importRel / sectionContent
section3Content = import4 / section4 / subsection / importRel / sectionContent
section4Content = import5 / section5 / subsection / importRel / sectionContent
section5Content = import6 / section6 / subsection / importRel / sectionContent
section6Content = subsection / importRel / sectionContent

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
import1 = BLOCK H1 importLink:importLink H_END { return importLink; }
import2 = BLOCK H2 importLink:importLink H_END { return importLink; }
import3 = BLOCK H3 importLink:importLink H_END { return importLink; }
import4 = BLOCK H4 importLink:importLink H_END { return importLink; }
import5 = BLOCK H5 importLink:importLink H_END { return importLink; }
import6 = BLOCK H6 importLink:importLink H_END { return importLink; }


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

paragraph = BLOCK !'#' !subsectionHeader contents:content+ {
  return {
    type: 'Paragraph',
    contents: contents
  };
}

// Any ASCII punctuation character may be backslash-escaped
escaped  = '\\' [\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]
inlineEntity = inlineEdit / inlineCode / reference / bold / italic / link / image / htmlTag

content = inlineEntity / text

textChar = escaped
         / [^\n\r+\-{`*_[!<]
         / '++' !'}'
         / '+' !'+}'
         / '--' !'}'
         / '-' !'-}'
         / !image '!'
         / !htmlTag '<'
         / SINGLE_NL

text = value:$textChar+ {
  return {
    type: 'Text',
    value: unescape(value)
  };
}

note = BLOCK 'NOTE'i (':' / WB) _ contents:content* {
  return {
    type: 'Note',
    contents: contents
  };
}

todo = BLOCK ('TODO'i / 'TK'i) (':' / WB) _ contents:content* {
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

italic = asteriskItalic / underscoreItalic

asteriskItalic = '*' contents:(inlineCode / link / text)+ '*' {
  return {
    type: 'Italic',
    contents: contents
  };
}

underscoreItalic = '_' contents:(inlineCode / link / bold / text)+ '_' {
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

inlineCode = code:(inlineCode1 / inlineCode2 / inlineCode3) {
  // https://spec.commonmark.org/0.29/#code-spans
  code = code.replace(/\r\n|\r|\n/g, ' ')
  if (code.startsWith(' ') && code.endsWith(' ') && !code.match(/^\s+$/)) {
    code = code.slice(1, -1)
  }
  return {
    type: 'InlineCode',
    code: code
  };
}

backTick1 = '`' !'`'
backTick2 = '``' !'`'
backTick3 = '```' !'`'

inlineCode1 = backTick1 code:$(!backTick1 ('`'+ / .))+ backTick1 {
  return code
}

inlineCode2 = backTick2 code:$(!backTick2 ('`'+ / .))+ backTick2 {
  return code
}

inlineCode3 = backTick3 code:$(!backTick3 ('`'+ / .))+ backTick3 {
  return code
}

blockCode = BLOCK '```' raw:('raw' WB _)? deprecatedCounterExample:'!'? lang:codeLang? _ example:('example'/'counter-example')? NL code:$([^`] / '`' [^`] / '``' [^`])+ '```' {
  // dedent codeblock by current indent level?
  if (deprecatedCounterExample) {
    console.warn(line() + ':' + column() + ': Use of `!` is deprecated, use `counter-example` instead.');
  }
  return {
    type: 'Code',
    raw: raw !== null,
    lang: lang,
    example: example !== null,
    counter: example === 'counter-example' || deprecatedCounterExample !== null,
    code: code
  };
}

codeLang = !('example'/'counter-example') lang:$([a-z][-a-z0-9]*) {
  return lang;
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

link = '[' contents:linkContent* ']' _ '(' _ url:$[^)]+ _ ')' {
  return {
    type: 'Link',
    contents: contents,
    url: url
  };
}

linkContent = inlineEntity / linkText

linkTextChar = escaped
             / [^\]\n\r+\-{\x60*!<] // \x60 = "`"
             / '++' !'}'
             / '+' !'+}'
             / '--' !'}'
             / '-' !'-}'
             / !image '!'
             / !htmlTag '<'

linkText = value:$linkTextChar+ {
  return {
    type: 'Text',
    value: unescape(value)
  };
}

image = '![' alt:$[^\]]+ '](' _ url:$[^)]+ _ ')' {
  return {
    type: 'Image',
    alt: unescape(alt),
    url: unescape(url)
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

listItem = LINE bullet:listBullet _ taskBox:taskBox? contents:content* sublist:indentedList? {
  if (sublist) {
    contents = contents.concat([sublist])
  }
  if (taskBox) {
    return {
      type: 'TaskListItem',
      done: taskBox.done,
      contents: contents
    };
  }
  return {
    type: 'ListItem',
    contents: contents
  };
}

listBullet = unorderedBullet / orderedBullet
unorderedBullet = $(('-' / '+' / '*') ' ')
orderedBullet = $(([1-9]+ '.') ' ')

taskBox = '[' done:(' ' / 'x' / 'X') ']' !(_ '(') {
  return { done: done !== ' ' }
}

// Table

table = BLOCK !'#' headers:(tableCells / tableOneColCells) LINE [ -|]+ rows:tableRow+ {
  return {
    type: 'Table',
    headers: headers,
    rows: rows
  };
}

tableRow = LINE !'#' cells:(tableCells / tableOneColCells) {
  return cells;
}

tableCells = ('|' _)? first:tableCell rest:(_ '|' _ tableCell)+ _ '|'? {
  return [first].concat(rest.map(function (nodes) {
    return nodes[3];
  }));
}

tableOneColCells = '|' _ first:tableCell _ '|'? {
  return [first];
}

tableCell = contents:tableCellContent+ {
  return contents;
}

tableCellContent = inlineEntity / tableCellText

tableCellTextChar = escaped
                  / [^|\n\r+\-{\x60*[!<] // \x60 = "`"
                  / '++' !'}'
                  / '+' !'+}'
                  / '--' !'}'
                  / '-' !'-}'
                  / !image '!'
                  / !htmlTag '<'

tableCellText = value:$tableCellTextChar+ {
  return {
    type: 'Text',
    value: unescape(value)
  };
}


// Names

name = localName / globalName
localName = name:$(('\\_' / [_a-z]) nameRest) {
  return unescape(name);
}
globalName = name:$([A-Z] nameRest) {
  return unescape(name);
}
nameRest = $('\\_' / [_a-zA-Z0-9])*


// Algorithm

algorithm = BLOCK call:call _ ':' ':'? steps:list {
  return {
    type: 'Algorithm',
    call: call,
    steps: orderify(steps)
  };
}

call = name:name '(' args:(noCallArgs / callArgs) ')' {
  return {
    type: 'Call',
    name: name,
    args: args
  };
}

noCallArgs = &')' {
  return [];
}

callArgs = __ first:value rest:(_ ','? __ token:value)* __ {
  return [first].concat(rest.map(nodes => nodes[3]));
}

value = stringLiteral / keyword / variable

stringLiteral = '"' value:$('\\"'/[^"\n\r])* closer:'"'? {
  if (closer === null) {
    error('Unclosed string literal.');
  }
  return {
    type: 'StringLiteral',
    // Unescape all but quote characters within a string literal.
    value: '"' + unescape(value).replace(/"/g, '\\"') + '"'
  };
}

keyword = value:$('null' / 'true' / 'false' / 'undefined') WB {
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

semantic = BLOCK name:nonTerminal _ defType:(':::'/'::'/':') __ !'one of' tokens:tokens steps:list {
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

production = BLOCK token:nonTerminal _ defType:(':::'/'::'/':') rhs:productionRHS {
  return {
    type: 'Production',
    token: token,
    defType: defType.length,
    rhs: rhs
  };
}

productionRHS = oneOfRHS / singleRHS / listRHS

oneOfRHS = !(LINE listBullet) __ 'one of' WB rows:(__ (NL _ listBullet?)? (_ token)+)+ {
  return {
    type: 'OneOfRHS',
    rows: rows.map(row => row[2].map(tokens => tokens[1]))
  };
}

singleRHS = !(LINE listBullet / 'one of') __ condition:(condition __)? tokens:tokens {
  return {
    type: 'RHS',
    condition: condition ? condition[0] : null,
    tokens: tokens
  };
}

listRHS = defs:(indentedRHS / listItemRHS+) {
  return { type: 'ListRHS', defs: defs };
}

indentedRHS = INDENT defs:(listItemRHS+)? DEDENT &{ return defs !== null; } {
  return defs;
}

listItemRHS = LINE listBullet _ condition:(condition __)? tokens:tokens {
  return {
    type: 'RHS',
    condition: condition ? condition[0] : null,
    tokens: tokens
  };
}

condition = '[' condition:$('+' / '~' / 'if' WB (__ 'not' WB)?) __ param:name ']' {
  return {
    type: 'Condition',
    param: param,
    not: condition === '~' || condition.indexOf('not') !== -1
  };
}

tokens = first:token rest:(__ token:token)* {
  return [first].concat(rest.map(nodes => nodes[1]));
}

token = token:unconstrainedToken quantifier:('\\'? ('+' / '?' / '*'))? constraint:(__ constraint)? {
  if (quantifier) {
    token = {
      type: 'Quantified',
      token: token,
      isList: quantifier[1] === '+' || quantifier[1] === '*',
      isOptional: quantifier[1] === '?' || quantifier[1] === '*'
    };
  }
  if (constraint) {
    token = {
      type: 'Constrained',
      token: token,
      constraint: constraint[1]
    }
  }
  return token;
}

unconstrainedToken = prose / emptyToken / lookahead / nonTerminal / regexp / quotedTerminal / terminal

prose = '"' text:$([^"\n\r]/'\\"')* closer:'"'? {
  if (closer === null) {
    error('Unclosed quoted prose.');
  }
  return {
    type: 'Prose',
    text: unescape(text)
  };
}

emptyToken = '[' _ 'empty' _ ']' {
  return {
    type: 'Empty'
  };
}

lookahead = '[' __ 'lookahead' WB not:(__ ('!=' / '!'))? __ set:(lookaheadSet/lookaheadItem)? __ closer:']'? {
  if (set === null || closer === null) {
    error('Malformed lookahead. Did you forget tokens?');
  }
  return {
    type: 'Lookahead',
    not: not !== null,
    nt: set.length === 1 && set[0].type === 'NonTerminal',
    set: set
  };
}

lookaheadSet = '{' set:((__ !'}' token _ ','?)+)? __ closer:'}'? {
  if (set === null || closer === null) {
    error('Malformed lookahead set. Did you forget tokens?');
  }
  return set.map(nodes => nodes[2]);
}

lookaheadItem = !(']' / '}') token:token {
  return [token];
}

nonTerminal = name:globalName params:nonTerminalParams? {
  return {
    type: 'NonTerminal',
    name: name,
    params: params,
  };
}

nonTerminalParams = '[' __ params:(nonTerminalParam _ ',' __)* param:nonTerminalParam? __ closer:']'? {
  if (param === null || closer === null) {
    error('Malformed terminal params.');
  }
  return params.map(param => param[0]).concat(param);
}

nonTerminalParam = conditional:[?!]? name:name {
  return {
    type: 'NonTerminalParam',
    conditional: conditional === '?',
    negated: conditional === '!',
    name: name
  };
}

constraint = butNot

butNot = 'but' WB __ 'not' WB __ ('one' WB __ 'of' WB __)? first:token rest:(__ ('or' WB / ',') __ token)* !(__ ('or' WB / ',')) {
  return {
    type: 'ButNot',
    tokens: [first].concat(rest.map(nodes => nodes[3]))
  };
}

regexp = '/' value:$(([^/\n] / '\\/')+)? closer:'/'? {
  if (value === null || closer === null) {
    error('Malformed regular expression.');
  }
  return {
    type: 'RegExp',
    value: '/' + unescape(value) + '/'
  };
}

quotedTerminal = inlineCode:inlineCode {
  if (inlineCode.code.length === 0) {
    error('Malformed quoted terminal');
  }
  return {
    type: 'Terminal',
    value: inlineCode.code
  };
}

terminal = value:$([^ \n"/`] [^ \n"\`,\]\}]*) {
  return {
    type: 'Terminal',
    value: unescape(value)
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
SINGLE_NL = NL !(NL / _ listBullet)
_ = ' '*
// Skips over whitespace including a single newline. Do not use more than once
// in a row, otherwise multiple NL will be skipped.
__ = _ SINGLE_NL? _
WB = ![a-zA-Z0-9]
EOF = NL* !.

lineStart = NL+ / & { return offset() === 0 }

blockStart = (NL NL+) / & { return offset() === 0 }

indentDepth = sp:$_ { return sp.length; }
