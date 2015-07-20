# A. Using Spec Markdown

If installed globally, using `spec-md` as a shell executable is the easiest way
to use Spec Markdown. The `spec-md` executable expects a filepath to a Markdown
document as input and outputs HTML on stdout. Use `>` to write stdout to a file.

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

The `spec-md` node module provides a few functions:

  * {html(filePath, options)} takes a {filepath} to a Markdown file and returns a
    Promise which will resolve to a beautified HTML string. This function is the
    primary usage of the `spec-md` module.
  * {parse(filePath)} takes a filepath and returns a Promise which will resolve
    to an AST *(Abstract Syntax Tree)* representing the contents of the Spec
    Markdown file, with all imports already inlined.
  * {print(ast, options)} takes an {ast} produced by parse() and returns an HTML
    string.
  * {visit(ast, visitor)} takes an {ast} and a {visitor}. It walks over the {ast}
    in a depth-first-traversal calling the {visitor} along the way.


## Print Options

The {html(filePath, options)} and {print(filePath)} functions both take {options}
as an optional second argument. These options allow for customization control
over the returned HTML, more options may be added in the future.

  * **highlight** - a function which is called when blocks of code are
    encountered, with the first argument as the string of code, the second
    argument being the language specified. This function should return well
    formed HTML, complete with escaped special characters.

