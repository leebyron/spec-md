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

  function format(text, followsEntity) {
    return unescape(
      text
        // Collapse spaces
        .replace(/[ \n\r]+/g, ' ')
        // Smart arrows
        .replace(/(^|[^\\])<-{1,3}>/g, '$1\u2194')
        .replace(/(^|[^\\])<-{1,3}(?=$|[^->])/g, '$1\u2190')
        .replace(/(^|[^\\<-])-{1,3}>/g, '$1\u2192')
        .replace(/(^|[^\\])<={1,3}>/g, '$1\u21D4')
        .replace(/(^|[^\\])<=={1,2}(?=$|[^=>])/g, '$1\u21D0')
        .replace(/(^|[^\\<=])={1,3}>/g, '$1\u21D2')
        // Math operators
        .replace(/(^|[^\\])~=/g, '$1\u2248')
        .replace(/(^|[^\\])<=(?=$|[^=>])/g, '$1\u2264')
        .replace(/(^|[^\\])>=/g, '$1\u2265')
        // Dashes and hyphens
        .replace(/(^|[^\\<-])--(?=$|[^->])/g, '$1\u2014')
        .replace(/(^|\S\s)-(?=$|\s[^\d])/g, '$1\u2013')
        // Smart quotes
        .replace(/(\s)"/g, '$1\u201C')
        .replace(RegExp(`(${followsEntity ? '' : '^'}|[^\\\\])"(?=\\w)`,'g'), '$1\u201C')
        .replace(/(^|[^\\])"/g, '$1\u201D')
        .replace(/(\w)'(?=\w)/g, '$1\u2019')
        .replace(/(\s)'/g, '$1\u2018')
        .replace(RegExp(`(${followsEntity ? '' : '^'}|[^\\\\])'(?=\\w)`,'g'), '$1\u2018')
        .replace(/(^|[^\\])'/g, '$1\u2019')
    );
  }

  function formattedText(value) {
    let prevChar;
    let prevOffset = location().start.offset
    do {
      prevChar = input[--prevOffset]
    } while (/[*~_+\-{}[\]]/.test(prevChar));
    const followsEntity = !/\s/.test(prevChar);
    return located({
      type: 'Text',
      value: format(value, followsEntity)
    });
  }

  let htmlBlockName;

  const BLOCK_TAGS_RX = /^(?:p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)$/i;

  function located(node) {
    const currentLocation = location();
    return Object.defineProperty(node, 'loc', {
      value: {
        source: options.source,
        start: currentLocation.start,
        end: currentLocation.end,
      }
    });
  }
}

// Document

initialDocument = ___ document:titledDocument EOF {
  return document;
}

importedDocument = ___ document:untitledDocument EOF {
  return document;
}

titledDocument = title:title ___ contents:documentBlocks {
  return located({
    type: 'Document',
    title: title,
    contents: contents
  });
}

untitledDocument = contents:documentBlocks {
  return located({
    type: 'Document',
    contents: contents
  });
}

title = markdownTitle / setextTitle

setextTitle = SAMEDENT value:$NOT_NL+ NL ('---' '-'* / '===' '='*) &EOL {
  return located({
    type: 'DocumentTitle',
    value: format(value)
  });
}

markdownTitle = SAMEDENT '#'+ _ value:headerText H_END &EOL {
  return located({
    type: 'DocumentTitle',
    value: value
  });
}

headerLookahead = &(SAMEDENT '#')

H1 = '#' !'#' _
H2 = '##' !'#' _
H3 = '###' !'#' _
H4 = '####' !'#' _
H5 = '#####' !'#' _
H6 = '######' !'#' _
H_END = _ '#'*
headerText = text:$headerChar+ {
  return format(text);
}
headerChar = [^\n\r# ]+ / [# ] headerChar

sectionID = start:$sectionIDStart rest:('.' $sectionIDPart)* '.' {
  return [start].concat(rest.map(function (nodes) {
    return nodes[1];
  }));
}
sectionIDStart = [0-9]+ / [A-Z]+ / '*'
sectionIDPart = [0-9]+ / '*'

header1 = SAMEDENT H1 secID:sectionID? _ title:headerText H_END &EOL {
  return located({
    type: 'Header',
    level: 1,
    secID: secID,
    title: title
  });
}

header2 = SAMEDENT H2 secID:sectionID? _ title:headerText H_END &EOL {
  return located({
    type: 'Header',
    level: 2,
    secID: secID,
    title: title
  });
}

header3 = SAMEDENT H3 secID:sectionID? _ title:headerText H_END &EOL {
  return located({
    type: 'Header',
    level: 3,
    secID: secID,
    title: title
  });
}

header4 = SAMEDENT H4 secID:sectionID? _ title:headerText H_END &EOL {
  return located({
    type: 'Header',
    level: 4,
    secID: secID,
    title: title
  });
}

header5 = SAMEDENT H5 secID:sectionID? _ title:headerText H_END &EOL {
  return located({
    type: 'Header',
    level: 5,
    secID: secID,
    title: title
  });
}

header6 = SAMEDENT H6 secID:sectionID? _ title:headerText H_END &EOL {
  return located({
    type: 'Header',
    level: 6,
    secID: secID,
    title: title
  });
}

section1 = header:header1 ___ contents:section1Blocks {
  return located({
    type: 'Section',
    header: header,
    contents: contents
  });
}

section2 = header:header2 ___ contents:section2Blocks {
  return located({
    type: 'Section',
    header: header,
    contents: contents
  });
}

section3 = header:header3 ___ contents:section3Blocks {
  return located({
    type: 'Section',
    header: header,
    contents: contents
  });
}

section4 = header:header4 ___ contents:section4Blocks {
  return located({
    type: 'Section',
    header: header,
    contents: contents
  });
}

section5 = header:header5 ___ contents:section5Blocks {
  return located({
    type: 'Section',
    header: header,
    contents: contents
  });
}

section6 = header:header6 ___ contents:section6Blocks {
  return located({
    type: 'Section',
    header: header,
    contents: contents
  });
}

subsectionHeader = SAMEDENT '**' title:$[^\n\r*]+ '**' &EOB {
  return located({
    type: 'Subheader',
    title: format(title)
  });
}

subsection = header:subsectionHeader ___ contents:subsectionBlocks {
  return located({
    type: 'Subsection',
    header: header,
    contents: contents,
  });
}

documentBlocks = blocks:(documentBlock ___)* { return blocks.map(block => block[0]); }
section1Blocks = blocks:(section1Block ___)* { return blocks.map(block => block[0]); }
section2Blocks = blocks:(section2Block ___)* { return blocks.map(block => block[0]); }
section3Blocks = blocks:(section3Block ___)* { return blocks.map(block => block[0]); }
section4Blocks = blocks:(section4Block ___)* { return blocks.map(block => block[0]); }
section5Blocks = blocks:(section5Block ___)* { return blocks.map(block => block[0]); }
section6Blocks = blocks:(section6Block ___)* { return blocks.map(block => block[0]); }
subsectionBlocks = blocks:(subsectionBlock ___)* { return blocks.map(block => block[0]); }

documentBlock = import1 / section1 / section1Block
section1Block = import2 / section2 / section2Block
section2Block = import3 / section3 / section3Block
section3Block = import4 / section4 / section4Block
section4Block = import5 / section5 / section5Block
section5Block = import6 / section6 / section6Block
section6Block = importRel / subsection / !headerLookahead block:sectionBlock { return block; }
subsectionBlock = !(headerLookahead / subsectionHeader) block:sectionBlock { return block; }

sectionBlock = note
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
             / definitionList
             / definitionParagraph
             / paragraph


// Import

importLink = link:link &{
  return link.url.slice(-3) === '.md' && !/^\/([a-z]*:\/\/)/.test(link.url);
} {
  return located({
    type: 'Import',
    path: link.url
  });
}

importRel = SAMEDENT importLink:importLink &EOB { return importLink; }
import1 = SAMEDENT H1 importLink:importLink H_END &EOL { return importLink; }
import2 = SAMEDENT H2 importLink:importLink H_END &EOL { return importLink; }
import3 = SAMEDENT H3 importLink:importLink H_END &EOL { return importLink; }
import4 = SAMEDENT H4 importLink:importLink H_END &EOL { return importLink; }
import5 = SAMEDENT H5 importLink:importLink H_END &EOL { return importLink; }
import6 = SAMEDENT H6 importLink:importLink H_END &EOL { return importLink; }


// Block Edit

blockEdit = blockIns / blockDel

blockIns = SAMEDENT '{++' EOB contents:subsectionBlocks '++}' &EOB {
  return located({
    type: 'BlockIns',
    contents: contents
  });
}

blockDel = SAMEDENT '{--' EOB contents:subsectionBlocks '--}' &EOB {
  return located({
    type: 'BlockDel',
    contents: contents
  });
}


// HTML Block

htmlBlock = SAMEDENT html:$(
  name:tagOpen &{
    if (BLOCK_TAGS_RX.test(name)) {
      htmlBlockName = name;
      return true;
    }
  }
  htmlContent*
  close:tagClose &{ return htmlBlockName === close; }
) &EOB {
  return located({
    type: 'HTMLBlock',
    name: htmlBlockName,
    html: html
  });
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

// Definitions

definitionList = definitionListLookahead SAMEDENT term:definitionListTerm defs:((NL (_ NL)?) definitionListDescription)+ &EOB {
  return located({
    type: 'DefinitionList',
    term: term,
    defs: defs.map(pair => pair[1])
  });
}

definitionListLookahead = &([^\n\r:]+ NL _ (NL _)? ':' &WS)

definitionListTerm = name:$definitionListTextChar+ {
  return located({
    type: 'DefinitionTerm',
    name: format(name)
  });
}

definitionListDescription = SAMEDENT ':' WS+ contents:definitionListContent+ {
  return located({
    type: 'DefinitionDescription',
    contents: contents
  });
}

definitionListContent = definitionListText / inlineEntity

definitionListTextChar = [^\n\r+\-{`*_[!<\\]+
                       / '\\' .?
                       / '+' !'+}'
                       / '-' !'-}'
                       / &'!' !image '!'
                       / &'[' !link '['
                       / &'<' !htmlTag '<'
                       / LINE_WRAP !':'

definitionListText = value:$definitionListTextChar+ {
  return formattedText(value);
}

definitionParagraph = SAMEDENT '::' WS+ leading:(!italic content)* term:definitionParagraphTerm trailing:content* &EOB &{
  // Must contain more than just the term.
  return leading.length + trailing.length > 0;
} {
  return located({
    type: 'DefinitionParagraph',
    term: term,
    contents: leading.map(pair => pair[1]).concat([term], trailing)
  });
}

definitionParagraphTerm = open:[*_] name:$textChar+ close:[*_] &{ return open === close; } {
  return located({
    type: 'DefinitionTerm',
    name: format(name)
  });
}

// Paragraph

paragraph = SAMEDENT contents:content+ &EOB {
  return located({
    type: 'Paragraph',
    contents: contents
  });
}

inlineEntity = inlineEdit / inlineCode / reference / bold / italic / link / image / htmlTag

content = text / inlineEntity

textChar = [^\n\r+\-{`*_[!<\\]+
         / '\\' .?
         / '+' !'+}'
         / '-' !'-}'
         / &'!' !image '!'
         / &'[' !link '['
         / &'<' !htmlTag '<'
         / LINE_WRAP

text = value:$textChar+ {
  return formattedText(value);
}

note = SAMEDENT 'NOTE'i (':' / WB) _ contents:content* &EOB {
  return located({
    type: 'Note',
    contents: contents
  });
}

todo = SAMEDENT ('TODO'i / 'TK'i) (':' / WB) _ contents:content* &EOB {
  return located({
    type: 'Todo',
    contents: contents
  });
}

bold = '**' contents:(text / italic / link / inlineCode)+ '**' {
  return located({
    type: 'Bold',
    contents: contents
  });
}

italic = asteriskItalic / underscoreItalic

asteriskItalic = '*' contents:(text / link / inlineCode)+ '*' {
  return located({
    type: 'Italic',
    contents: contents
  });
}

underscoreItalic = '_' contents:(text / bold / link / inlineCode)+ '_' {
  return located({
    type: 'Italic',
    contents: contents
  });
}

inlineEdit = ins / del

ins = '{++' contents:content* '++}' {
  return located({
    type: 'Ins',
    contents: contents
  });
}

del = '{--' contents:content* '--}' {
  return located({
    type: 'Del',
    contents: contents
  });
}

htmlTag = tag:$('<' '/'? [a-z]+ [^>]* '>') {
  return located({
    type: 'HTMLTag',
    tag: tag
  });
}

reference = '{' !('++'/'--') _ ref:(call / value / token)? _ close:'}'? {
  if (ref === null || close === null) {
    error('Malformed {reference}.');
  }
  return ref;
}

inlineCode = &'`' code:(inlineCode1 / inlineCode2 / inlineCode3) {
  // https://spec.commonmark.org/0.29/#code-spans
  code = code.replace(/\r\n|\n|\r/g, ' ')
  if (code.startsWith(' ') && code.endsWith(' ') && !code.match(/^\s+$/)) {
    code = code.slice(1, -1)
  }
  return located({
    type: 'InlineCode',
    code: code
  });
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

blockCode = SAMEDENT '```' raw:('raw' WB _)? deprecatedCounterExample:'!'? lang:codeLang? _ example:('example'/'counter-example')? NL code:$([^`] / '`' [^`] / '``' [^`])+ '```' &EOL {
  // dedent codeblock by current indent level?
  if (deprecatedCounterExample) {
    console.warn(line() + ':' + column() + ': Use of `!` is deprecated, use `counter-example` instead.');
  }
  return located({
    type: 'Code',
    raw: raw !== null,
    lang: lang,
    example: example !== null,
    counter: example === 'counter-example' || deprecatedCounterExample !== null,
    code: code
  });
}

codeLang = !('example'/'counter-example') lang:$([a-z][-a-z0-9]*) {
  return lang;
}

indentCode =
  // To safely maintain indent state, must parse ahead first
  &(&CODE_INDENT first:indentCodeLine? rest:(NL indentCodeLine)* DEDENT &{ return first !== null })
    &CODE_INDENT first:indentCodeLine rest:(NL indentCodeLine)* DEDENT {
  return located({
    type: 'Code',
    code: [first].concat(rest.map(pair => pair[1])).join('\n')
  });
}

indentCodeLine = depth:indentDepth &{ return depth >= indent; } code:$NOT_NL+ {
  return Array(depth - indent + 1).join(' ') + code;
}


// Link & Image

link = '[' __ contents:linkContent* __ ']' '(' __ url:url __ title:linkTitle? __ ')' {
  return located({
    type: 'Link',
    contents: contents,
    url: url,
    title: title
  });
}

linkContent = linkText / inlineEntity

linkTextChar = [^\n\r+\-{`*!<\]\\]+
             / '\\' .?
             / '+' !'+}'
             / '-' !'-}'
             / &'!' !image '!'
             / &'<' !htmlTag '<'

linkText = value:$linkTextChar+ {
  return formattedText(value);
}

url = rawUrl:(pointyUrl / parensUrl) {
  return decodeURI(unescape(rawUrl));
}

pointyUrl = '<' rawUrl:$([^<>\\\n\r]+ / '\\' [^\n\r])* '>' {
  return rawUrl;
}

parensUrl = !'<' rawUrl:$(parensUrlChar*) {
  return rawUrl;
}

parensUrlChar = [^()\\ \t\n\r]+ / '\\' [^ \t\n\r] / '(' parensUrlChar* ')'

linkTitle = rawString:(doubleTitle / singleTitle / parensTitle) {
  return format(rawString);
}

doubleTitle = '"' value:$([^"\\\n\r]+ / '\\' [^\n\r] / '\\' &[\n\r] / LINE_WRAP)* '"' {
  return value;
}

singleTitle = "'" value:$([^'\\\n\r]+ / '\\' [^\n\r] / '\\' &[\n\r] / LINE_WRAP)* "'" {
  return value;
}

parensTitle = '(' value:$([^()\\\n\r]+ / '\\' [^\n\r] / '\\' &[\n\r] / LINE_WRAP)* ')' {
  return value;
}

image = '![' alt:$[^\x5D]+ '](' __ url:url __ title:linkTitle? __ ')' {
  return located({
    type: 'Image',
    alt: format(alt),
    url: url,
    title: title,
  });
}


// List

list = indentedList / unorderedList / orderedList

indentedList =
  // To safely maintain indent state, must parse ahead first
  &(&LIST_INDENT list:(unorderedList / orderedList)? DEDENT &{ return list !== null; })
  &LIST_INDENT list:(unorderedList / orderedList) DEDENT {
  return list;
}

unorderedList = &(SAMEDENT unorderedBullet) first:listItem rest:(___ listItem)* {
  return located({
    type: 'List',
    ordered: false,
    items: [first].concat(rest.map(pair => pair[1]))
  });
}

orderedList = &(SAMEDENT orderedBullet) first:listItem rest:(___ listItem)* {
  return located({
    type: 'List',
    ordered: true,
    items: [first].concat(rest.map(pair => pair[1]))
  });
}

listItem = SAMEDENT bullet:listBullet _ taskBox:taskBox? contents:content* &EOL sublist:(___ indentedList)? {
  if (sublist) {
    contents = contents.concat([sublist[1]])
  }
  if (taskBox) {
    return located({
      type: 'TaskListItem',
      done: taskBox.done,
      contents: contents
    });
  }
  return located({
    type: 'ListItem',
    contents: contents
  });
}

listBullet = unorderedBullet / orderedBullet
unorderedBullet = $(('-' / '+' / '*') WS)
orderedBullet = $(([1-9]+ '.') WS)

taskBox = '[' done:(' ' / 'x' / 'X') ']' WS {
  return located({
    done: done !== ' '
  });
}

// Table

table = tableLookahead header:tableHeader NL alignments:tableDelimiter &{ return header.cells.length === alignments.length } rows:(NL tableRow)* &EOB {
  header.alignments = alignments;
  rows = rows.map(pair => pair[1]);
  rows.forEach(row => {
    row.alignments = alignments;
    if (row.cells.length > header.cells.length) {
      row.cells.length = header.cells.length;
    } else while (row.cells.length < header.cells.length) {
      row.cells.push({ type: 'Text', value: '' });
    }
  });
  return located({
    type: 'Table',
    header: header,
    rows: rows
  });
}

tableLookahead = &([^\n\r]+ NL [ -]* [|:] [ |:-]* NL)

tableHeader = cells:tableCells {
  return located({
    type: 'TableHeader',
    cells: cells
  });
}

tableRow = cells:tableCells {
  return located({
    type: 'TableRow',
    cells: cells
  });
}

pipe = _ '|' _

tableDelimiter = SAMEDENT pipe? first:tableAlign rest:(pipe tableAlign)* pipe? &EOL {
  return [first].concat(rest.map(pair => pair[1]));
}

tableAlign = left:':'? '-'+ right:':'? {
  return left && right ? 'center' : left ? 'left' : right ? 'right' : null;
}

tableCells = SAMEDENT pipe? first:tableCell rest:(pipe tableCell)* pipe? &EOL {
  return [first].concat(rest.map(pair => pair[1]));
}

tableCell = contents:tableCellContent+ {
  return contents;
}

tableCellContent = tableCellText / inlineEntity

tableCellTextChar = [^ |\n\r+\-{`*[!<]+
                  / WS+ ![ |\n\r] // Do not capture trailing space in a cell
                  / '\\' .?
                  / '+' !'+}'
                  / '-' !'-}'
                  / &'!' !image '!'
                  / &'[' !link '['
                  / &'<' !htmlTag '<'

tableCellText = value:$tableCellTextChar+ {
  return formattedText(value);
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

algorithm = SAMEDENT call:call _ ':' ':'? ___ steps:list {
  return located({
    type: 'Algorithm',
    call: call,
    steps: orderify(steps)
  });
}

call = name:name '(' args:(noCallArgs / callArgs) ')' {
  return located({
    type: 'Call',
    name: name,
    args: args
  });
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
  return located({
    type: 'StringLiteral',
    // Unescape all but quote characters within a string literal.
    value: '"' + unescape(value).replace(/"/g, '\\"') + '"'
  });
}

keyword = value:$('null' / 'true' / 'false' / 'undefined') WB {
  return located({
    type: 'Keyword',
    value: value
  });
}

variable = name:localName {
  return located({
    type: 'Variable',
    name: name
  });
}


// Grammar productions

semantic = SAMEDENT name:nonTerminal _ defType:(':::'/'::'/':') __ !'one of' tokens:tokens ___ steps:list {
  return located({
    type: 'Semantic',
    name: name,
    defType: defType.length,
    rhs: {
      type: 'RHS',
      tokens: tokens
    },
    steps: orderify(steps)
  });
}

production = SAMEDENT token:nonTerminal _ defType:(':::'/'::'/':') rhs:productionRHS {
  return located({
    type: 'Production',
    token: token,
    defType: defType.length,
    rhs: rhs
  });
}

productionRHS = !(EOL _ listBullet) __ rhs:oneOfRHS { return rhs; }
              / !(EOL _ listBullet) __ rhs:singleRHS { return rhs; }
              / EOL rhs:listRHS { return rhs; }

oneOfRHS = 'one of' WB rows:((EOL SAMEDENT listBullet / __)? (_ token)+)+ &EOB {
  return located({
    type: 'OneOfRHS',
    rows: rows.map(row => row[1].map(tokens => tokens[1]))
  });
}

singleRHS = !'one of' condition:(condition __)? tokens:tokens &EOB {
  return located({
    type: 'RHS',
    condition: condition ? condition[0] : null,
    tokens: tokens
  });
}

listRHS = first:listItemRHS rest:(___ listItemRHS)* {
  return located({
    type: 'ListRHS',
    defs: [first].concat(rest.map(pair => pair[1]))
  });
}

listItemRHS = _ listBullet _ condition:(condition __)? tokens:tokens &EOL {
  return located({
    type: 'RHS',
    condition: condition ? condition[0] : null,
    tokens: tokens
  });
}

condition = '[' condition:$('+' / '~' / 'if' WB (__ 'not' WB)?) __ param:name ']' {
  return located({
    type: 'Condition',
    param: param,
    not: condition === '~' || condition.indexOf('not') !== -1
  });
}

tokens = first:token rest:(__ token:token)* {
  return [first].concat(rest.map(nodes => nodes[1]));
}

token = token:unconstrainedToken quantifier:('\\'? ('+' / '?' / '*'))? constraint:(__ constraint)? {
  if (quantifier) {
    token = located({
      type: 'Quantified',
      token: token,
      isList: quantifier[1] === '+' || quantifier[1] === '*',
      isOptional: quantifier[1] === '?' || quantifier[1] === '*'
    });
  }
  if (constraint) {
    token = located({
      type: 'Constrained',
      token: token,
      constraint: constraint[1]
    });
  }
  return token;
}

unconstrainedToken = prose / emptyToken / lookahead / nonTerminal / regexp / quotedTerminal / terminal

prose = '"' text:$([^"\n\r]/'\\"')* closer:'"'? {
  if (closer === null) {
    error('Unclosed quoted prose.');
  }
  return located({
    type: 'Prose',
    text: format(text)
  });
}

emptyToken = '[' _ 'empty' _ ']' {
  return located({
    type: 'Empty'
  });
}

lookahead = '[' __ 'lookahead' WB not:(__ ('!=' / '!'))? __ set:(lookaheadSet/lookaheadItem)? __ closer:']'? {
  if (set === null || closer === null) {
    error('Malformed lookahead. Did you forget tokens?');
  }
  return located({
    type: 'Lookahead',
    not: not !== null,
    nt: set.length === 1 && set[0].type === 'NonTerminal',
    set: set
  });
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
  return located({
    type: 'NonTerminal',
    name: name,
    params: params,
  });
}

nonTerminalParams = '[' __ params:(nonTerminalParam _ ',' __)* param:nonTerminalParam? __ closer:']'? {
  if (param === null || closer === null) {
    error('Malformed terminal params.');
  }
  return params.map(param => param[0]).concat(param);
}

nonTerminalParam = conditional:[?!]? name:name {
  return located({
    type: 'NonTerminalParam',
    conditional: conditional === '?',
    negated: conditional === '!',
    name: name
  });
}

constraint = butNot

butNot = 'but' WB __ 'not' WB __ ('one' WB __ 'of' WB __)? first:token rest:(__ ('or' WB / ',') __ token)* !(__ ('or' WB / ',')) {
  return located({
    type: 'ButNot',
    tokens: [first].concat(rest.map(nodes => nodes[3]))
  });
}

regexp = '/' value:$(([^/\n\r] / '\\/')+)? closer:'/'? {
  if (value === null || closer === null) {
    error('Malformed regular expression.');
  }
  return located({
    type: 'RegExp',
    value: '/' + unescape(value) + '/'
  });
}

quotedTerminal = inlineCode:inlineCode {
  return located({
    type: 'Terminal',
    value: inlineCode.code
  });
}

terminal = value:$([^ \n\r"/`] [^ \n\r"\`,\]\}]*) {
  return located({
    type: 'Terminal',
    value: unescape(value)
  });
}


// Lines and Indentation

SAMEDENT = depth:indentDepth &{
  return depth >= indent && depth < indent + 4;
}

LIST_INDENT = depth:indentDepth &{ return depth >= indent + 2; } {
  indentStack.push(indent);
  indent = depth;
}

CODE_INDENT = depth:indentDepth &{ return depth >= indent + 4; } {
  indentStack.push(indent);
  indent = indent + 4;
}

DEDENT = !{ indentStack.length === 0 } {
  indent = indentStack.pop();
}

indentDepth = sp:$_ { return sp.replace(/\t/g, '    ').length; }

WS = [ \t]
NL = '\n' / '\r\n' / '\r'
NOT_NL = !NL .
// Skips over whitespace including a single newline. Do not use more than once
// in a row, otherwise multiple NL will be skipped.
LINE_WRAP = NL _ !(NL / listBullet / headerLookahead)
_ = WS*
// Whitespace followed by an optional Line Wrap
__ = _ LINE_WRAP?
// Skips over all new lines and empty lines, but not the white space at the
// beginning of the next non-empty line.
___ = (_ NL)*

// Word boundary
WB = ![a-zA-Z0-9]

// End of line (require at least one new line given remaining source)
EOL = (_ NL)+ / EOF
// End of block (require at least two new line given remaining source)
EOB = (_ NL) (_ NL)+ / EOF
// End of file (allows trailing whitespace and empty lines)
EOF = ___ !.
