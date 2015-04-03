# Spec additions

TODO


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

```!
Header
------
```

Spec Markdown also requires that only single `#` headers appear at the top of a
document, and that only a `##` header (and not a `###` header) can be contained
with the section started by a `#` header.


### Section Numbers

TODO


### Table of Contents

TODO



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

Spec Markdown allows allows escaping the \| character with `\|`.


### Tables

TODO

Similar to Github flavored Markdown

| This | is | table |
| ---- | -- | ----- |
| key  | val| etc   |


## Todo

TODO


## Note

TODO


## Syntax Highlighting

TODO

```js
var baz = foo("bar");
```

### Counter Examples

TODO

```!js
var shit = dontSwear();
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

TODO


### Grammar Production

TODO


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
