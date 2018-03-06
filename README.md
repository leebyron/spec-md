Spec Markdown
=============

Renders Markdown with some additions into an HTML format commonly used for
writing technical specification documents. Markdown additions include code
syntax highlighting, edit annotations, and the definition of algorithms and
grammar productions.

**Philosophy**

Spec Markdown is first and foremost Markdown. As such, it follows Markdown's
philosophy of intending to be as easy to read and easy to write as is feasible.

In order to interoperate with other tools which use Markdown, Spec Markdown
tries to add as little additional syntax as possible, instead preferring
conventions. This means any documents written with Spec Markdown in mind should
render adequately by other Markdown renderers.

To support the rendering additions of Spec Markdown, some features of Markdown
may be limited or removed. As an example, Spec Markdown is strict about the
order and locations of headers in a document.

Note: This is not a normative spec for Spec Markdown, but just documentation of
this tool. It is also very much a work in progress.


# Getting Started

To use Spec Markdown, just write Markdown files. There are some conventions used
by Spec Markdown which you can read about in [Spec additions](#spec-additions).

To convert your Markdown files into an HTML spec document, use the `spec-md`
utility.

```sh
npm install -g spec-md
spec-md ./path/to/markdown.md > ./path/to/output.html
```

You can also require `spec-md` as a node module.

```sh
npm install --save-dev spec-md
```

```js
var fs = require('fs');
var specMarkdown = require('spec-md');
specMarkdown.html('./path/to/markdown.md').then(function (html) {
  fs.writeFile('./path/to/output.html', html);
});
```

You can use `nodemon` to continuously regenerate HTML as you edit the 
specification.  For example, the following scripts can be added to
`package.json`:

```json
{
   "scripts": {
     "spec": "spec-md ./specification/SPEC.md > ./specification/spec.html",
     "spec:watch": "nodemon --watch specification/SPEC.md --exec 'yarn spec'"
     ...
   }
}
```

Invoking `yarn spec` will generate the `specification/spec.html` file while
invoking `yarn spec:watch` will continuously watch for changes and regenerate
the HTML whenever `specification/SPEC.md` is modified.  This functionality can
be used in conjunction with live previewing functionality (*e.g.,* the "Live 
Server Preview" extension in VSCode) to immediately preview changes as they 
are made.

Spec Markdown also provides utilities for generating and operating on an
intermediate representation of the markdown, which you can explore in
[Using Spec Markdown](#using-spec-markdown).


# [Markdown](./spec/Markdown.md)

# [Spec additions](./spec/SpecAdditions.md)

# [Using Spec Markdown](./spec/Usage.md)

# [Contributing](./CONTRIBUTING.md)
