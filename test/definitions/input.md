# Definition

# Definition lists

Term
: Definition

Term
: Definition that is really long
and spans multiple lines

Term
: Definition that is really long
        and spans multiple indented lines

Paragraph followed by a

Term
: Definition

Terms can have
: One definition
: Two definitions
: And more definitions

Term

: Definition can be separated by an empty line

: Multiple times

## Not definition lists

Term
:Definition lacking leading space, not a definition

Term
:: Has too many colons

Multi line
Term
: Isn't a definition

Term


: With a definition after two empty lines, not a definition

Term : Definition on the same line, not a definition

Term
    : Indented too far

# Definition paragraph

:: A *definition paragraph* defines a term within a paragraph which might be
easier to read than a typical definition list. Since it's a normal paragraph
: line continuations can also start with colons.
:: Or double colons.

:: A *definition paragraph* may contain additional *italicized* phrases.

:: A _definition paragraph_ may define its term in either \* or \_ italics.

:: *Term* at the start.

:: Or at the end, the *term*

## Not definition paragraphs

:: A definition paragraph must contain an italicized term.

::: *This* has too many colons.

::*This* is missing a leading space.

Paragraph
:: *This* immediately follows a paragraph

:: *just a term*

# Definition references

A *Term* can later be referenced with italics.

A _Term_ can use either \* or \_ italics.
