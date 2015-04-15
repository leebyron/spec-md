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

Spec Markdown makes it easier to describe context-free grammatical productions.

Grammars are defined by a sequence of *terminal* characters or sequence of
characters, which are then referenced by *non-terminal* rules. The definition
of a non-terminal is referred to as a *production*.


### Grammar Production

The `::` token indicates an "is defined as" production for a non-terminal,
where a single definition can be written directly after the `::`.

```
PBJ :: Bread PeanutButter Jelly Bread
```

Produces:

PBJ :: Bread PeanutButter Jelly Bread

Or if |PBJ| has definition options, they are written immediately after as a
Markdown list.

```
PBJ ::
  - Bread PeanutButter Jelly Bread
  - Bread Jelly PeanutButter Bread
```

Produces:

PBJ ::
  - Bread PeanutButter Jelly Bread
  - Bread Jelly PeanutButter Bread

Each definition is a space seperated list of *terminal* or *non-terminal*
tokens, and may also include conditionals and constraints.

Definition lists aren't required to be indented:

```
PBJ ::

- Bread PeanutButter Jelly Bread
- Bread Jelly PeanutButter Bread
```

Produces:

PBJ ::

- Bread PeanutButter Jelly Bread
- Bread Jelly PeanutButter Bread



### One of

If each definition option is a single token, it can be expressed as a "one of"
expression instead of a markdown list.

```
AssignmentOperator :: one of *= `/=` %= += -= <<= >>= >>>= &= ^= |=
```

Produces:

AssignmentOperator :: one of *= `/=` %= += -= <<= >>= >>>= &= ^= |=


"one of" can also be followed by a line break and multiple lines of tokens

```
Keyword :: one of
  break     do        in          typeof
  case      else      instanceof  var
  catch     export    new         void
  class     extends   return      while
  const     finally   super       with
  continue  for       switch      yield
  debugger  function  this
  default   if        throw
  delete    import    try
```

Produces:

Keyword :: one of
  break     do        in          typeof
  case      else      instanceof  var
  catch     export    new         void
  class     extends   return      while
  const     finally   super       with
  continue  for       switch      yield
  debugger  function  this
  default   if        throw
  delete    import    try


### Non Terminal Token

Non-terminal tokens with a defined as a grammar production can be referred to
in other grammar productions. Non-terminals must match the regular expression
|/[A-Z][_a-zA-Z]*/|. That is, they must start with an uppercase letter, followed
by any number of letters or underscores.



### Prose

Grammars can describe arbitrary rules by using prose within a grammar
definition by using `"quotes"`.

```
Sandwich :: Bread "Any kind of topping" Bread
```

Produces:

Sandwich :: Bread "Any kind of topping" Bread



### Terminal Token

Terminal tokens refer to a character or sequence of characters. They can be
written unadorned in the grammar definition.

```
BalancedParens :: ( BalancedParens )
```

Produces:

BalancedParens :: ( BalancedParens )

Any sequence of characters can be written to indicate a terminal token:

```
WhileStatement :: while ( Expression ) { Statements }
```

Produces

WhileStatement :: while ( Expression ) { Statements }

Terminals can also be quoted with back-ticks <code>\`</code> to remove any
ambiguity from other meanings, for example to allow a terminal token to start
with an uppercase letter, or a slash / or backslash \\.

```
DivisionExpression :: Expression `/` Expression
```

Produces

DivisionExpression :: Expression `/` Expression



### Regular Expression

When a grammar is intended to be interpretted as a single token and can be
clearly written as a regular expression, you can do so directly.

```
UppercaseWord :: /[A-Z][a-z]*/
```

Produces:

UppercaseWord :: /[A-Z][a-z]*/



### Modifications

Non-terminal tokens can be followed by modifications to alter their meaning and
as a short-hand for common patterns.


**Optional Tokens**

A subscript suffix `Token?` renders as |Token?| and is a shorthand for two
possible definitions, one including that token and one excluding it.

```
Sentence :: Noun Verb Adverb?
```

Produces:

Sentence :: Noun Verb Adverb?

Which is shorthand for:

Sentence ::
  - Noun Verb
  - Noun Verb Adverb


**Token Lists**

A subscript suffix `Token+` renders as |Token+| and is shorthand for a list
of one or more of that token.

```
Book :: Cover Page+ Cover
```

Produces:

Book :: Cover Page+ Cover

Which, unless your specification document declares otherwise, is shorthand for:

Book :: Cover Page_list Cover

Page_list ::
  - Page
  - Page_list Page

Some specifications may wish to declare |Token+| as a shorthand for a
comma-separated list, in which case the previous example would be shorthand for:

Book :: Cover Page_list Cover

Page_list ::
  - Page
  - Page_list , Page


**Optional Lists**

Both `+` and `?` can be used together as |Token+?|:

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


### Conditional Parameters

It can be a useful short-hand to provide conditional parameters when defining a
non-terminal token rather than defining two very similar non-terminals.

A conditional parameter is written in braces `Token[Param]` and renders
as |Token[Param]|. When used in definitions is shorthand for two symbol
definitions: one appended with that parameter name, the other without.

```
Example[WithCondition] :: "Definition TBD"
```

Produces:

Example[WithCondition] :: "Definition TBD"

Which is shorthand for:

Example :: "Definition TBD"

Example_WithCondition :: "Definition TBD"


The conditions are applied at the beginning of a definition for the
non-terminal by prefixing with `[+Param]` or `[~Param]` to only include the
definition when the variant with the conditional parameter is or is not
used, respectively.

```
Example[WithCondition] ::
  - A
  - [+WithCondition] B
  - [~WithCondition] C
```

Produces:

Example[WithCondition] ::
  - A
  - [+WithCondition] B
  - [~WithCondition] C

Which is shorthand for:

Example ::
  - A
  - C

Example_WithCondition ::
  - A
  - B


The same bracket suffix on a non-terminal within a definition is shorthand for
using that variant of the definition. If the parameter starts with `?`,
that form of the symbol is used if in a symbol definition with the same
parameter.

```
Example[WithCondition] ::
  - Example
  - Example[WithCondition]
  - Example[?WithCondition]
```

Produces:

Example[WithCondition] ::
  - Example
  - Example[WithCondition]
  - Example[?WithCondition]

Which is shorthand for:

Example ::
  - Example
  - Example_WithCondition
  - Example

Example_WithCondition ::
  - Example
  - Example_WithCondition
  - Example_WithCondition


Multiple conditional parameters can be used, in which case it is short form for
the permutation of all conditions:

```
Example[P, Q] :: "Definition TBD"
```

Produces:

Example :: "Definition TBD"

Example_P :: "Definition TBD"

Example_Q :: "Definition TBD"

Example_P_Q :: "Definition TBD"


Conditional params can be followed by the list and optional modifiers

```
A[P, ?Q]+?
```

Produces:

|A[P, ?Q]+?|



### Constraints

Any token can be followed by "but not" or "but not one of" to place a further
constraint on the previous token:

```
Example :: A B but not foo or bar
```

Produces:

Example :: A B but not foo or bar



## Algorithms

Specifications for procedures or algorithms can be defined in terms of nested
markdown lists. These lists can be of any kind, but will always have ordered
formatting. The bullet labeling for algorithms is specific will cycle between
decimal, lower-alpha, and lower-roman.

```
Algorithm(arg) ::
  1. first
  1. then
    * subset
    * another step
  1. okay
```

Produces:

Algorithm(arg) ::
  1. first
  1. then
    * subset
    * another step
  1. okay
