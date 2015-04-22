# Stormpath Node.js SDK

[![NPM Version](https://img.shields.io/npm/v/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![NPM Downloads](http://img.shields.io/npm/dm/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![Build Status](https://img.shields.io/travis/stormpath/stormpath-sdk-node.svg?style=flat)](https://travis-ci.org/stormpath/stormpath-sdk-node)

*A simple user management library for Node.js.*

[Stormpath](https://stormpath.com) is a complete user management API.  This
library gives your Node app access to all of Stormpath's features:

- Robust authentication and authorization.
- Schemaless user data.
- Pre-built or hosted login screens.
- Social login with Facebook and Google OAuth.
- Generate and manage API keys for your service.

If you have feedback about this library, please get in touch and share your
thoughts! support@stormpath.com

[Stormpath](https://stormpath.com) is a User Management API that reduces
development time with instant-on, scalable user infrastructure.  Stormpath's
intuitive API and expert support make it easy for developers to authenticate,
manage, and secure users and roles in any application.


## Documentation

All of this library's documentation can be found here:
http://docs.stormpath.com/nodejs/api/home (*It's ridiculously easy to get
started with.*)


## Links

Below are some resources you might find useful!

- [Quickstart](http://docs.stormpath.com/nodejs/quickstart/)
- [Stormpath Node.js API Documentation](http://docs.stormpath.com/nodejs/api)

**Express-Stormpath**

- [Express-Stormpath Integration](https://github.com/stormpath/stormpath-express)
- [Express-Stormpath Docs](https://docs.stormpath.com/nodejs/express/)
- [15-Minute Tutorial: Build a Webapp with Node, Express, Bootstrap & Stormpath](https://stormpath.com/blog/build-nodejs-express-stormpath-app/)
- [Deploy Stormpath on Heroku with Express.js](https://github.com/stormpath/stormpath-heroku-express-sample)

**Passport-Stormpath**

- [Stormpath Passport Strategy](https://github.com/stormpath/passport-stormpath)
- [stormpath-passport-express Sample App repo](https://github.com/stormpath/stormpath-passport-express-sample)
- [Stormpath Passport Docs](https://docs.stormpath.com/nodejs/passport/)
- [15-Minute Tutorial: Build a Webapp With Node.js, Express, Passport and Stormpath](https://stormpath.com/blog/build-app-nodejs-express-passport-stormpath/)


## Install

```bash
npm install stormpath
```


## Quickstart

The Quickstart is on the front page of the [Stormpath Node.js API Documentation](http://docs.stormpath.com/nodejs/api).


## Building

This code does not require a build step and can be immediately required by your node application after installed from npm (see above).

You may run the unit tests with the grunt command:

```bash
grunt
```

Or the integration tests (which assume an apikey file in `~/.stormpath`):

```bash
grunt it
```

To build the documentation, you need to enter the `docs` directory, then run:

```console
$ npm install -g bower
$ npm install
$ bower install
$ grunt
```

The `grunt serve` command will build and serve the docs locally on port 9000.  You can
view the HTML documentation by visiting http://localhost:9000/home in your browser.


## Contributing

In lieu of a formal style guide, take care to maintain the existing coding
style.  Add unit tests for any new or changed functionality.  Lint and test
your code using [Grunt](http://gruntjs.com/).

You can make your own contributions by forking the develop branch of this
repository, making your changes, and issuing pull request on the develop branch.

We regularly maintain this repository, and are quick to review pull requests and
accept changes!

We <333 contributions!


## Copyright

Copyright &copy; 2015 Stormpath, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
