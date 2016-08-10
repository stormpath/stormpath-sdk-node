# Contribution Guide

We love pull requests!

Here are a few things you'll need to know if you want to make a contribution to
this library.

### Submitting Pull Requests

Pull requests are welcome, and will be reviewed as soon as possible.  Please
ensure that the tests are passing and that new features have test coverage. When
you submit the PR the tests will fail on Travis, even if they are working locally.
This is because we use encrypted environment variables on Travis, and this will
fail for PRs from forks.  This is okay, we will pull down your branch and run
the tests locally for confirmation.

### Documentation

This library uses JsDoc for documentation.  To build the docs:

```
npm run docs
```

The output will be placed in `./apidocs`.  If you are going to do a lot of work
on the documentation, I suggest the development script, it will rebuild the
files when you make changes, and open a web server with the documentation:

```
./docs/develop.sh
```

If you need to modify the theme or template, you can find that in `docs/template`.
This template was cloned from the [Docstrap][] project.

[Docstrap]: https://github.com/docstrap/docstrap

