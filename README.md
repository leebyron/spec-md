Spec Markdown
-------------

Additions to Markdown for writing specification documents

Note: this document isn't done


# Spec Syntax #

## Smart quotes

Prose text has "smart quotes", hyphens, en-dashes and em-dashes--you shouldn't
have to think about it, they'll just work.

For example, a quote of a quote (with an inner apostrophe for flair):

"She told me that 'he isn't here right now' - so I left.".

Smart arrows ---> and <- and <-> can be written as `->`, `<-` and `<->`. Fat
smart arrows ===> and <== and <=> can be written as `=>`, `<==` and `<=>`.

Math operators like >=, <=, and ~= can be written as `>=`, `<=`, and `~=`.

Well formed HTML entities can be written inline, as `&copy;`. &copy; <-- a
copyright, but & < > are escaped.

You can explicitly enter a \* character with `\*`.


## Editing

A portion of the [CriticMarkup](http://criticmarkup.com/) spec is supported.

For example, we can {++add++} or {--remove--} text with the `{++add++}` or
`{--remove--}` syntax.

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


## Other stuff

This is an [-->*example*<--](https://www.facebook.com) of a link.
This is an `example` of some code.

This is an example of an |Algorithm(foo, "string", null)| call reference.


I can reference |foo|, |"foo"|, |null|, |true|.

This is an algorithm:

Algorithm(arg) ::
  1. first
  2. then
  3. okay

And this is a list

  1. this
  2. is
  3. a
    - nested
  4. list

And this is a non-indented list

1. this
2. is
3. a
  - nested
4. list


And here's an example:

```js
var baz = foo("bar");
```

And a counter-example

```!js
var shit = dontSwear();
```

Example of **bold** and *italic* and ***bold italic***

**Here is a table**

| This | is | table |
| ---- | -- | ----- |
| key  | val| etc   |

Here is an image!

![Specs](http://stmcoatech.com/Admin/Welding/d639c91b-f07b-4629-83fd-a00739c21b57.jpg)


When compiled, an import reference will be inlined into the same document. An
import reference looks like a link to a ".md" file as a single paragraph.

```
[AnythingGoesHere](SomeName.md)
```

You can optionally prefix the import reference with # characters to describe at
what section level the import should apply. By default an import reference will
be imported as a child of the current section.
