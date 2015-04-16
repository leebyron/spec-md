# Contributing to Spec Markdown

We want to make contributing to this project as easy and transparent as
possible. Hopefully this document makes the process for contributing clear and
answers any questions you may have. If not, feel free to open an
[Issue](https://github.com/leebyron/spec-md/issues).

## Pull Requests

All active development of Spec Markdown happens on GitHub. We actively welcome
your [pull requests](https://help.github.com/articles/creating-a-pull-request).

  1. [Fork the repo](https://github.com/leebyron/spec-md/) and create your branch from `master`.
  2. Install all dependencies. (`npm install`)
  3. If you've added code, add tests.
  4. If you've changed APIs, update the documentation.
  5. Run tests and ensure your code passes lint. (`npm test`)

## `master` is unsafe

We will do our best to keep `master` in good shape, with tests passing at all
times. But in order to move fast, we might make API changes that your
application might not be compatible with. We will do our best to communicate
these changes and always [version](http://semver.org/) appropriately so you can
lock into a specific version if need be. If any of this is worrysome to you,
just use [npm](https://www.npmjs.org/package/spec-md).

## Issues

We use GitHub issues to track public bugs and requests. Please ensure your bug
description is clear and has sufficient instructions to be able to reproduce the
issue. The best way is to provide a reduced test case on jsFiddle or jsBin.

## Coding Style

* 2 spaces for indentation (no tabs)
* 80 character line length strongly preferred.
* Prefer `'` over `"`
* Use semicolons;
* Trailing commas,
* Avd abbr wrds.

## License

By contributing to Spec Markdown, you agree that your contributions will be
licensed under its MIT license.
