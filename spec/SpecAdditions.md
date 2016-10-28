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

#### 3.2.3.8. Custom Numbers

If the section number is written in the document, the last number will be used
as the number for that section. This is useful when writing a proposal against
an existing spec and wish to reference a particular section.

The header for this section was written as

```
#### 3.2.3.8. Custom Numbers
```

#### Appendix / Annex Sections

If a top level section is written with a letter, such as `A` instead of a
number, that will begin an Appendix section.

```
# A. Appendix: Grammar
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

Smart arrows -> and <- and <-> can be written as `->`, `<-` and `<->`.

Fat smart arrows => and <== and <=> can be written as `=>`, `<==` and `<=>`.


### Additional escape sequence

Spec Markdown allows escaping \< \> and \| character with `\>`, `\<`,
and `\|`.


### Tables

Similar to Github flavored Markdown

```
| This | is a | table |
| ---- | ---- | ----- |
| key  | val  | etc   |
```

Produces the following:

| This | is a | table |
| ---- | ---- | ----- |
| key  | val  | etc   |

Table cells can contain any content that a paragraph can contain.


## Note

Notes can be written inline with a spec document, and are often helpful to
supply non-normative explanatory text or caveats in a differently formatted
style. Case insensitive, the `:` is optional.

```
Note: Notes are awesome.
```

Produces the following:

Note: Notes are awesome.


## Todo

It's often helpful to write a draft of a document and leave "to-do" comments in
not-yet-completed sections. Case insensitive, the `:` is optional.

```
TODO: finish this section
```

Produces the following:

TODO: finish this section

Note: You can also write `TK` in place of `TODO`, nerds.


## Syntax Highlighting

Spec Markdown will apply syntax highlighting to blocks of code if a
github-flavored-markdown style language is supplied.

You may provide a `highlight` function as an option to customize this behavior.

To render this highlighted javascript:

    ```js
    var baz = foo("bar");
    ```

Produces the following:

```js
var baz = foo("bar");
```


### Counter Examples

Spec Markdown helps you write counter-examples and visually indicate the
difference from other code blocks. Just write `!` after the <code>\`\`\`</code>
and before the language.

    ```!js
    var shit = dontSwear();
    ```

Produces the following:

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

Note: imports and section headers cannot be included in a added or removed
section to preserve the ability to render a table of contents.



## Algorithms

Specifications for procedures or algorithms can be defined in terms of nested
markdown lists. These lists can be of any kind, but will always have ordered
formatting. The bullet labeling for algorithms is specific will cycle between
decimal, lower-alpha, and lower-roman.

An algorithm definition also describes its arguments in terms of variables.

```
Algorithm(arg) :
  1. first
  1. then
    * substep
      * deeper substep
      * another deep substep
    * another step
  1. okay
```

Produces the following:

Algorithm(arg) :
  1. first
  1. then
    * substep
      * deeper substep
      * another deep substep
    * another step
  1. okay



## Grammar

Spec Markdown makes it easier to describe context-free grammatical productions.

Grammars are defined by a sequence of *terminal* characters or sequence of
characters, which are then referenced by *non-terminal* rules. The definition
of a non-terminal is referred to as a *production*.


### Grammar Production

The `:` token indicates an "is defined as" production for a non-terminal,
where a single definition can be written directly after the `:`.

```
PBJ : Bread PeanutButter Jelly Bread
```

Produces the following:

PBJ : Bread PeanutButter Jelly Bread

Or if {PBJ} has definition options, they are written immediately after as a
Markdown list.

```
PBJ :
  - Bread PeanutButter Jelly Bread
  - Bread Jelly PeanutButter Bread
```

Produces the following:

PBJ :
  - Bread PeanutButter Jelly Bread
  - Bread Jelly PeanutButter Bread

Each definition is a space seperated list of *terminal* or *non-terminal*
tokens, and may also include conditionals and constraints.

Definition lists aren't required to be indented:

```
PBJ :

- Bread PeanutButter Jelly Bread
- Bread Jelly PeanutButter Bread
```

Produces the following:

PBJ :

- Bread PeanutButter Jelly Bread
- Bread Jelly PeanutButter Bread


### Production types

Often languages wish to specify different types of grammar productions, such as
lexical or syntactical, or if certain characters line whitespace or newlines are
permitted between symbols in the right-hand-side. Spec-md allows this this
distinction based on the number of colons:

```
TypeOne : `type` `one`

TypeTwo :: `type` `two`

TypeThree ::: `type` `three`
```

Produces the following:

TypeOne : `type` `one`

TypeTwo :: `type` `two`

TypeThree ::: `type` `three`


### One of

If each definition option is a single token, it can be expressed as a "one of"
expression instead of a markdown list.

```
AssignmentOperator : one of *= `/=` %= += -= <<= >>= >>>= &= ^= |=
```

Produces the following:

AssignmentOperator : one of *= `/=` %= += -= <<= >>= >>>= &= ^= |=


"one of" can also be followed by a line break and multiple lines of tokens

```
Keyword : one of
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

Produces the following:

Keyword : one of
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
{/[A-Z][_a-zA-Z]*/}. That is, they must start with an uppercase letter, followed
by any number of letters or underscores.



### Prose

Grammars can describe arbitrary rules by using prose within a grammar
definition by using `"quotes"`.

```
Sandwich : Bread "Any kind of topping" Bread
```

Produces the following:

Sandwich : Bread "Any kind of topping" Bread



### Terminal Token

Terminal tokens refer to a character or sequence of characters. They can be
written unadorned in the grammar definition.

```
BalancedParens : ( BalancedParens )
```

Produces the following:

BalancedParens : ( BalancedParens )

Any sequence of characters can be written to indicate a terminal token:

```
WhileStatement : while ( Expression ) { Statements }
```

Produces

WhileStatement : while ( Expression ) { Statements }

Terminals can also be quoted with back-ticks <code>\`</code> to remove any
ambiguity from other meanings, for example to allow a terminal token to start
with an uppercase letter, or a slash `/` or backslash `\`, or later
contain a `]` or `}`.

```
DivisionExpression : Expression `/` Expression
```

Produces

DivisionExpression : Expression `/` Expression



### Regular Expression

When a grammar is intended to be interpretted as a single token and can be
clearly written as a regular expression, you can do so directly.

```
UppercaseWord : /[A-Z][a-z]*/
```

Produces the following:

UppercaseWord : /[A-Z][a-z]*/



### Quantifiers

Non-terminal tokens can be followed by quantifiers to alter their meaning and
as a short-hand for common patterns.


**Optional Tokens**

A subscript suffix `Token?` renders as {Token?} and is a shorthand for two
possible definitions, one including that token and one excluding it.

```
Sentence : Noun Verb Adverb?
```

Produces the following:

Sentence : Noun Verb Adverb?

Which is shorthand for:

Sentence :
  - Noun Verb
  - Noun Verb Adverb


**Token Lists**

A subscript suffix `Token+` renders as {Token+} and is shorthand for a list
of one or more of that token.

```
Book : Cover Page+ Cover
```

Produces the following:

Book : Cover Page+ Cover

Which, unless your specification document declares otherwise, is shorthand for:

Book : Cover Page_list Cover

Page_list :
  - Page
  - Page_list Page

Some specifications may wish to declare {Token+} as a shorthand for a
comma-separated list, in which case the previous example would be shorthand for:

Book : Cover Page_list Cover

Page_list :
  - Page
  - Page_list , Page


**Optional Lists**

A subscript suffix `Token*` renders as {Token*} and is shorthand for an
optional list, which describes zero or more of that token.

```
Sandwich : Bread Topping* Bread
```

Produces the following:

Sandwich : Bread Topping* Bread

Which is shorthand for:

Sandwich :
  - Bread Bread
  - Bread Topping_list Bread

Topping_list :
  - Topping
  - Topping_list Topping


### Conditional Parameters

It can be a useful short-hand to provide conditional parameters when defining a
non-terminal token rather than defining two very similar non-terminals.

A conditional parameter is written in braces `Token[Param]` and renders
as {Token[Param]}. When used in definitions is shorthand for two symbol
definitions: one appended with that parameter name, the other without.

```
Example[WithCondition] : "Definition TBD"
```

Produces the following:

Example[WithCondition] : "Definition TBD"

Which is shorthand for:

Example : "Definition TBD"

Example_WithCondition : "Definition TBD"


The conditions are applied at the beginning of a definition for the
non-terminal by prefixing with `[+Param]` or `[~Param]` to only include the
definition when the variant with the conditional parameter is or is not
used, respectively.

```
Example[WithCondition] :
  - A
  - [+WithCondition] B
  - [~WithCondition] C
```

Produces the following:

Example[WithCondition] :
  - A
  - [+WithCondition] B
  - [~WithCondition] C

Which is shorthand for:

Example :
  - A
  - C

Example_WithCondition :
  - A
  - B


The same bracket suffix on a non-terminal within a definition is shorthand for
using that variant of the definition. If the parameter starts with `?`,
that form of the symbol is used if in a symbol definition with the same
parameter.

```
Example[WithCondition] :
  - Example
  - Example[WithCondition]
  - Example[?WithCondition]
```

Produces the following:

Example[WithCondition] :
  - Example
  - Example[WithCondition]
  - Example[?WithCondition]

Which is shorthand for:

Example :
  - Example
  - Example_WithCondition
  - Example

Example_WithCondition :
  - Example
  - Example_WithCondition
  - Example_WithCondition


Multiple conditional parameters can be used, in which case it is short form for
the permutation of all conditions:

```
Example[P, Q] : "Definition TBD"
```

Produces the following:

Example : "Definition TBD"

Example_P : "Definition TBD"

Example_Q : "Definition TBD"

Example_P_Q : "Definition TBD"


Conditional params can be followed by the optional list quantifier

```
A[P, ?Q]*
```

Produces the following:

{A[P, ?Q]*}



### Constraints

Any token can be followed by "but not" or "but not one of" to place a further
constraint on the previous token:

```
Example : A B but not foo or bar
```

Produces the following:

Example : A B but not foo or bar


Optionally can mention "one of", this will be omitted when rendered. Commas can
be used instead of "or".

```
Example : A B but not one of foo, bar
```

Produces the following:

Example : A B but not one of foo, bar


### Meta Tokens

Spec Markdown can specify some tokens which do not consume any characters.

The empty set, written `[empty]` appears as {[empty]} can be used to define
a non-terminal as matching no terminal or non-terminal tokens.

```
Example : [empty]
```

Produces the following:

Example : [empty]


Lookaheads can appear anywhere in a sequence of tokens, and describe additional
constraints on the following token.

```
Example :
  - [lookahead token] Token
  - [lookahead ! token] Token
  - [lookahead != token] Token
  - [lookahead {token, set}] Token
  - [lookahead ! {token, set}] Token
  - [lookahead != {token, set}] Token
```

Produces the following:

Example :
  - [lookahead token] Token
  - [lookahead ! token] Token
  - [lookahead != token] Token
  - [lookahead {token, set}] Token
  - [lookahead {token, set}] Token
  - [lookahead ! {token, set}] Token
  - [lookahead != {token, set}] Token



## Grammar Semantics

Once grammar is defined, it can be useful to define the semantics of the grammar
in terms of algorithm steps. A single grammar definition followed by a list
is interpretted as a grammar semantic:

```
PBJ : Bread PeanutButter Jelly Bread

* Let {bottomBread} be the result of placing the first {Bread} on the plate.
* Let {pbSpread} be the result of getting {PeanutButter} from the jar.
* Spread {pbSpread} onto {bottomBread}.
* Let {topBread} be the result of placing the last {Bread} on the plate.
* Let {jamSpread} be the result of getting {Jelly} from the jar.
* Spread {jamSpread} onto {topBread}.
* Let {sandwich} be the result of rotating {topBread} 180&deg; and placing on {bottomBread}.
* Return {sandwich}.
```

Produces the following:

PBJ : Bread PeanutButter Jelly Bread

* Let {bottomBread} be the result of placing the first {Bread} on the plate.
* Let {pbSpread} be the result of {PeanutButter}.
* Spread {pbSpread} onto {bottomBread}.
* Let {topBread} be the result of placing the last {Bread} on the plate.
* Let {jamSpread} be the result of {Jelly}.
* Spread {jamSpread} onto {topBread}.
* Let {sandwich} be the result of rotating {topBread} 180&deg; and placing on {bottomBread}.
* Return {sandwich}.



## Value Literals

Value literals allow any text to refer to a value which has semantic meaning
in the specification by wrapping it in `{ }` curly brace characters.

```
I can reference {foo}, {"foo"}, {null}, {true}.
```

Produces the following:

I can reference {foo}, {"foo"}, {null}, {true}.


**Variables**

Write `{foo}` to produce a variable (represented by a \<var> tag) like {foo}.

**Keywords**

Some known keywords like {null}, {undefined}, {true} and {false} are rendered
as constants instead of variables.

**String literal**

Write `{"foo"}` to produce a string literal like {"foo"}.

**Grammar tokens**

Any grammar token can be written inline, like `{Example}` to represent the
non-terminal token {Example}, <code>\{\`terminal\`\}</code> to represent the
terminal token {`terminal`}. Even meta tokens like `{[empty]}` for {[empty]} and
`{[lookahead !{ x, y }]}` for {[lookahead !{ x, y }]}.

**Algorithm calls**

A call to an algorithm can be expressed as a value literal:

```
{Algorithm(foo, "string", null)}
```

Produces the following:

{Algorithm(foo, "string", null)}



## Biblio

By supplying a `"biblio"` key in a metadata file, you can have Algorithm calls
and Non-terminal tokens which are not defined in this spec to link to where they
are defined.

```
spec-md -m metadata.json myspec.md
```

Where metadata.json includes:

```
{
  "biblio": {
    "http://people.mozilla.org/~jorendorff/es6-draft.html": {
      "Identifier": "#sec-names-and-keywords",
      "PrimaryExpression": "#sec-primary-expression",
      "ReturnIfAbrupt()": "#sec-returnifabrupt",
      "Get()": "#sec-get-o-p"
    }
  }
}
```

Then referring to these tokens will link out to that page.

```
MemberExpression : PrimaryExpression . Identifier

  * Let {reference} be the result of evaluating {PrimaryExpression}.
  * Let {propName} be the string value of {Identifier}.
  * Let {value} be {Get(reference, propName)}.
  * {ReturnIfAbrupt(value)}.
  * Return {value}.
```

Produces the following:

MemberExpression : PrimaryExpression . Identifier

  * Let {reference} be the result of evaluating {PrimaryExpression}.
  * Let {propName} be the string value of {Identifier}.
  * Let {value} be {Get(reference, propName)}.
  * {ReturnIfAbrupt(value)}.
  * Return {value}.
