# Stormpath Node.js SDK 

[![NPM Version](https://img.shields.io/npm/v/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![NPM Downloads](http://img.shields.io/npm/dm/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![Build Status](https://img.shields.io/travis/stormpath/stormpath-sdk-node.svg?style=flat)](https://travis-ci.org/stormpath/stormpath-sdk-node)

[Stormpath](https://stormpath.com) is a complete user management API, with a wire range of support for Node.js Apps

This SDK gives your Node app access to all of Stormpath's user features:
•	Robust Authentication and Authorization
•	Schemaless user data
•	Pre-built or hosted login screens
•	Social login with Facebook and Google OAuth
•	Great for multi-tenant SaaS Applications
•	Generate and manage API keys for your service

Stormpath automatically scales with your application, without the overhead of building and managing user infrastructure

If you have questions or need help, please get in touch. [support@stormpath.com](mailto:support@stormpath.com)

## Links
+ [Quickstart](http://docs.stormpath.com/nodejs/quickstart/)
+ [Stormpath Node.js API Documentation](http://docs.stormpath.com/nodejs/api)

**Stormpath-Express**
+ [Stormpath-Express Integration](https://github.com/stormpath/stormpath-express)
+ [Stormpath-Express Docs](https://docs.stormpath.com/nodejs/express/)
+ [15-Minute Tutorial: Build a Webapp with Node, Express, Bootstrap & Stormpath](https://stormpath.com/blog/build-nodejs-express-stormpath-app/)
+ [Deploy Stormpath on Heroku with Express.js](https://github.com/stormpath/stormpath-heroku-express-sample)
+ [90-second video demo](https://www.youtube.com/watch?v=58wZyVaGR2c)

**Stormpath-Passport**
+ [Stormpath Passport Strategy](https://github.com/stormpath/passport-stormpath)
+ [stormpath-passport-express Sample App repo](https://github.com/stormpath/stormpath-passport-express-sample)
+ [Stormpath Passport Docs](https://docs.stormpath.com/nodejs/passport/)
+ [15-Minute Tutorial: Build a Webapp With Node.js, Express, Passport and Stormpath](https://stormpath.com/blog/build-app-nodejs-express-passport-stormpath/)


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


### Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

### Copyright

Copyright &copy; 2014 Stormpath, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).
