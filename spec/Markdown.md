# Markdown

Spec Markdown is first and foremost [Markdown](http://daringfireball.net/projects/markdown/syntax).
More specifically, it's based on [Github-flavored Markdown](https://help.github.com/articles/github-flavored-markdown/).

This section explains the syntax and capabilities of Markdown that Spec Markdown
supports and augments.


## Character Encoding

Markdown allows you to write text which uses &, <, and >. The output HTML will
automatically use the `&amp;`, `&lt;`, and `&gt;` entities.

Well formed HTML entities can be written inline directly. If you write `&copy;`,
it will appear in the HTML output as &copy;.


### Escape sequence

Markdown makes use of certain characters to format text, in order to render one
explicitly, place a backslash before it.

You can type \*literal asterisks\* instead of emphasis by typing
`\*literal asterisks\*`.

Escaping does not apply within code.

Spec Markdown provides backslash escapes for the following characters:

```
\   backslash
`   backtick
*   asterisk
_   underscore
{}  curly braces
[]  square brackets
()  parentheses
#   hash mark
+   plus sign
-   minus sign (hyphen)
.   dot
!   exclamation mark
<   less-than    <-- added in Spec Markdown
>   greater-than <-- added in Spec Markdown
|   pipe         <-- added in Spec Markdown
```


## Inline formatting

Markdown allows for inline stylistic and structual formatting. Inline
formatting is allowed in paragraphs, list items, and table cells.


### Inline HTML

Markdown is not a replacement for HTML and instead leverages HTML by allowing
its use inline within paragraphs, links, etc.

This code has <blink>blinking</blink> and <em>emphasized</em> formatting.

Markdown syntax can continue to be <u>used *within* inline HTML</u>.


### Links

Use `[ ]` square brackets to indicate linked text followed immediately by `( )`
parenthesis to describe the URL the text will link to.

The linked text can contain any other inline formatting.

```
This is an [-->*example*<--](https://www.facebook.com) of a link.
```

Produces the following:

This is an [-->*example*<--](https://www.facebook.com) of a link.


Todo: Links do not yet support a reference style short-form.

Todo: Links do not yet support a title attribute.


### Emphasis

Wrapping asterisks *(\*)* indicate emphasis. Like Github-flavored
Markdown, Spec Markdown does not treat underscore *(_)* as emphasis.

```
Example of **bold** and *italic* and ***bold italic***.
```

Produces the following:

Example of **bold** and *italic* and ***bold italic***.



### Inline Code

Wrapping back-ticks *(\`)* indicate inline code, text inside back-ticks is not
formatted, allowing for special characters to be used in inline code without
escapes.

```
This is an `example` of some inline code.
```

Produces

This is an `example` of some inline code.


Todo: Markdown's double-back-tick syntax is not yet supported.


### Images

```
![Specs](http://i.imgur.com/aV8o3rE.png)
```

Produces the following:

![Specs](http://i.imgur.com/aV8o3rE.png)

Also, consider using images for support of more complex features like
graph diagrams. For example, with Graviso:

```
![How spec-md works](http://g.gravizo.com/svg?
  digraph specmd {
    markdown [shape=box];
    ast [shape=box];
    html [shape=box];
    markdown -> parse [weight=8];
    parse -> ast;
    ast -> print;
    edge [color=red];
    print -> html;
  }
)
```

Produces the following:

![How spec-md works](http://g.gravizo.com/svg?
  digraph specmd {
    markdown [shape=box];
    ast [shape=box];
    html [shape=box];
    markdown -> parse [weight=8];
    parse -> ast;
    ast -> print;
    edge [color=red];
    print -> html;
  }
)

TODO: the title attribute is not yet supported



## Blocks

Markdown allows for block-level structual formatting. Every block is seperated
by at least two new lines. Spec Markdown makes use of Markdown's blocks to
produce more specific structural formatting.


### Block HTML

Markdown is not a replacement for HTML and instead leverages HTML by allowing
its use as complete blocks when separated from surrounding content by blank
lines.

Note: Markdown formatting syntax is not processed within block-level HTML tags.

For example, to add an HTML table to a Markdown article:

```
Unrelated previous paragraph followed by a blank line

<table>
<tr>
<td>Table cell</td>
<td>

<table>
<tr>
<td>*Tables in tables*</td>
</tr>
</table>

</td>
</tr>
</table>
```

Produces the following:

Unrelated previous paragraph followed by a blank line

<table>
<tr>
<td>Table cell</td>
<td>

<table>
<tr>
  <td>*Tables in tables*</td>
</tr>
</table>

</td>
</tr>
</table>

And using `<pre>` produces a simple code block:

```
<pre>
Buffalo Bill ’s
defunct
       who used to
       ride a watersmooth-silver
                                stallion
and break onetwothreefourfive pigeonsjustlikethat
                                                 Jesus
he was a handsome man
                     and what i want to know is
how do you like your blueeyed boy
Mister Death
</pre>
```

Produces the following:

<pre>
Buffalo Bill ’s
defunct
       who used to
       ride a watersmooth-silver
                                stallion
and break onetwothreefourfive pigeonsjustlikethat
                                                 Jesus
he was a handsome man
                     and what i want to know is
how do you like your blueeyed boy
Mister Death
</pre>


### Section Headers

Regular Markdown supports two styles of headers, Setext and atx, however Spec
Markdown generally only supports atx style headers.

```
# Header
```

Setext headers are not supported by Spec Markdown.

```!
Header
------
```

The number of `#` characters refers to the depth of the section. To produce an,
`<h3>`, type `###`. Optionally, a header may be "closed" by any number of `#`
characters.

Note: Spec Markdown requires that documents start with `#` and that each section
contained within is only one level deeper. An \<h1> section may only contain
\<h2> sections.


### Paragraphs

Paragraphs are the most simple Markdown blocks. Lines are appended together to
form a single \<p> tag. Any inline syntax is allowed within a paragraph.


### Lists

Markdown lists are lines which each start with either a ordered bullet `1.` or
unordered bullet, `*`, `-`, or `+`. Lists are optionally indented by two spaces.

Lists can be nested within other lists by indenting by at least two spaces.

```
  1. this
  2. is
  3. a
    - nested
  4. list
```

Produces the following:

  1. this
  2. is
  3. a
    - nested
  4. list


### Code Block

A block of code is formed by either indenting by 4 spaces, or wrapping with
<code>\`\`\`</code> on their own lines.

    ```
    var code = sample();
    ```

Produces the following:

```
var code = sample();
```


### Block Quotes

Spec markdown does not yet support Markdown's `>` style block quotes.


### Horizontal Rules

Spec Markdown does not yet support Markdown's `---` style \<hr>.


### Automatic Links

Spec Markdown does not yet automatically link urls.
