# Spec additions

Spec Markdown makes some additions to Markdown to support cases relevant to
writing technical specs and documentation. It attempts to be as minimally
invasive as possible, leveraging existing Markdown formatting features whenever
possible so Spec Markdown documents may render adequately as regular Markdown.

Spec Markdown also makes restrictions to the overall format of the Markdown
document in order to derive a structure to the entire document.


## Title and Introduction

A Spec Markdown document should start with one Setext style header which will be
used as the title of the document. Any content before the first atx (`#`) style
header will become the introduction to the document.

A Spec Markdown document starts in this form:

```
Spec Markdown
-------------

Introductory paragraph.

# First Section Header
```


## Sections

A Spec Markdown document is separated into a sequence and hierarchy of sections.
Those sections can then be used as navigation points and can be used to create
a table of contents. A section is started by a header and ends at either the
next header of similar or greater precedence or the end of the document. A
section can contain other sections if their headers are of lower precedence.


### Section Headers

Regular Markdown supports two styles of headers, Setext and atx, however Spec
Markdown only supports atx style headers as section headers.

```
# Header
```

Only use Setext style headers for the title of the document.

```!
Header
------
```

Spec Markdown also requires that only single `#` headers appear at the top of a
document, and that only a `##` header (and not a `###` header) can be contained
with the section started by a `#` header.


### Table of Contents

A table of contents is automatically generated from the hierarchy of sections in
the Spec Markdown document.


### Section Numbers

A number is associated with each section, starting with 1. In a hierarchy of
sections, the parent sections are joined with dots. This provides an unambiguous
location identifier for a given section in a document.

You can specify these section numbers directly in your Markdown documents if you
wish by writing them directly after the `#` and before the text of the header.

#### 3.2.3.8 Custom Numbers

If the section number is written in the document, the last number will be used
as the number for that section. This is useful when writing a proposal against
an existing spec and wish to reference a particular section.

The header for this section was written as

```
#### 3.2.3.8 Custom Numbers
```


## Smart Characters

The Spec Markdown renderer will replace easy to type characters like quotes and
dashes with their appropriate typographic entities. These replacements will not
occur within blocks of code.


### Quotes and Dashes

Prose text has "smart quotes", hyphens, en-dashes and em-dashes--you shouldn't
have to think about it, they'll just work.

For example, a quote of a quote (with an inner apostrophe and emphasis for flair):

`"She told me that 'he isn't here right *now*' - so I left."`

Will render as:

"She told me that 'he isn't here right *now*' - so I left."


### Math

Math operators like >=, <=, and ~= can be written as `>=`, `<=`, and `~=`.


### Arrows

Smart arrows ---> and <- and <-> can be written as `->`, `<-` and `<->`.

Fat smart arrows ===> and <== and <=> can be written as `=>`, `<==` and `<=>`.


### Additional escape sequence

Spec Markdown allows allows escaping \< \> and \| character with `\>`, `\<`,
and `\|`.


### Tables

Similar to Github flavored Markdown

| This | is | table |
| ---- | -- | ----- |
| key  | val| etc   |

Can be created by writing:

```
| This | is | table |
| ---- | -- | ----- |
| key  | val| etc   |
```

Table cells can contain any content that a paragraph can contain.


## Todo

It's often helpful to write a draft of a document and leave "to-do" comments in
not-yet-completed sections. Case insensitive, the `:` is optional.

For example

TODO: finish this section

is written simply as

```
TODO: finish this section
```

You can also write `TK` in place of `TODO`.


## Note

Notes can be written inline with a spec document, and are often helpful to
supply non-normative explanatory text or caveats in a differently formatted
style. Case insensitive, the `:` is optional.

For example

Note: Notes are awesome.

is written simply as

```
Note: Notes are awesome.
```


## Syntax Highlighting

Spec Markdown will apply syntax highlighting to blocks of code if a
github-flavored-markdown style language is supplied.

You may provide a `highlight` function as an option to customize this behavior.

To render this highlighted javascript:

```js
var baz = foo("bar");
```

You only have to write:

```
` ``js
var baz = foo("bar");
` ``
```

TODO: properly preserving content within block elements like \<pre> could make
this less awful to write. Also supporting double-indent code blocks.


### Counter Examples

Spec Markdown helps you write counter-examples and visually indicate the
difference from other code blocks. Just write `!` after the <code>\`\`\`</code>
and before the language.

```!js
var shit = dontSwear();
```

By writing:

```
` ``!js
var shit = dontSwear();
` ``
```


## Imports

When compiled, an import reference will be inlined into the same document. An
import reference looks like a link to a ".md" file as a single paragraph.

```
[AnythingGoesHere](SomeName.md)
```

You can optionally prefix the import reference with `#` characters to describe at
what section level the import should apply. By default an import reference will
be imported as a child of the current section.


## Inline editing

A portion of the [CriticMarkup](http://criticmarkup.com/) spec is supported.

For example, we can {++add++} or {--remove--} text with the `{++add++}` or
`{--remove--}` syntax.


## Block editing

We can also add and remove entire blocks of content, by using `{++` or `{--`
on their own line with empty lines on either side:

{++

These paragraphs

have been *added*.

++}

And

{--

These paragraphs

have been *removed*.

--}

By typing:

```
{++

These paragraphs

have been *added*.

++}

And

{--

These paragraphs

have been *removed*.

--}
```

Note: imports and section headers cannot be marked as added or removed to
preserve the ability to render a table of contents.


## Value Literals

TODO

I can reference |foo|, |"foo"|, |null|, |true|.

### Variables

TODO

|foo|


### String Literals

TODO

|"foo"|


### Builtin Value Literals

TODO

|null| or |true|


### Grammar Non-Terminals

TODO


### Algorithm Calls

TODO

This is an example of an |Algorithm(foo, "string", null)| call reference.


## Grammar

Spec Markdown makes it easier to describe Grammatical productions in a style of
BNF. The `::` token indicates a production definition, where the right hand side
can be written directly after the `::` or immediately after as a Markdown list.

### Grammar Production

Symbols are defined (ex. Symbol ::) as either one sequence of symbols or a list
of possible sequences of symbols, either as a bulleted list or using the
"one of" short hand.

A subscript suffix `?` renders as "<sub>opt</sub>" and is a shorthand for two
possible sequences, one including that symbol and one excluding it.

```
Sentence :: Noun Verb Adverb?
```

Produces:

Sentence :: Noun Verb Adverb?

Which is shorthand for:

Sentence ::
  - Noun Verb
  - Noun Verb Adverb

A subscript suffix `+` renders as "<sub>list</sub>" and is shorthand for a list
of one or more of that symbol.

```
Book :: Cover Page+ Cover
```

Produces:

Book :: Cover Page+ Cover

Which is shorthand for:

Book :: Cover Page_list Cover

Page_list ::
  - Page
  - Page_list Page

Both `+` and `?` can be used together:

```
Sandwich :: Bread Topping+? Bread
```

Produces:

Sandwich :: Bread Topping+? Bread

Which is shorthand for:

Sandwich ::
  - Bread Bread
  - Bread Topping_list Bread

Topping_list ::
  - Topping
  - Topping_list Topping


A symbol definition subscript suffix parameter in braces `[Param]` renders as
subscript and is shorthand for two symbol definitions, one appended with that
parameter name, the other without. The same subscript suffix on a symbol is
shorthand for that variant of the definition. If the parameter starts with `?`,
that form of the symbol is used if in a symbol definition with the same
parameter. Some possible sequences can be included or excluded conditionally
when respectively prefixed with `[+Param]` and `[~Param]`.

```
Example[Param] ::
  - A
  - B[Param]
  - C[?Param]
  - [+Param] D
  - [~Param] E
```

Produces:

Example[Param] ::
  - A
  - B[Param]
  - C[?Param]
  - [+Param] D
  - [~Param] E

Which is shorthand for:

Example ::
  - A
  - B_param
  - C
  - E

Example_param ::
  - A
  - B_param
  - C_param
  - D

Multiple params can be used, and params can be used with lists and optional
tokens as well:

```
Example[P, Q] :: A[P, ?Q]+?
```

Produces:

Example[P, Q] :: A[P, ?Q]+?


### Terminal

TODO


### Regular Expression

TODO


### One of

TODO


### Non Terminal

TODO


### Conditions

TODO


### Constraints

TODO


## Algorithms

TODO

This is an algorithm:

Algorithm(arg) ::
  1. first
  2. then
  3. okay
