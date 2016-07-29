# Stormpath Node.js SDK Documentation

[![NPM Version](https://img.shields.io/npm/v/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![NPM Downloads](http://img.shields.io/npm/dm/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![Build Status](https://img.shields.io/travis/stormpath/stormpath-sdk-node.svg?style=flat)](https://travis-ci.org/stormpath/stormpath-sdk-node)
[![Coverage Status](https://coveralls.io/repos/stormpath/stormpath-sdk-node/badge.svg?branch=master&service=github)](https://coveralls.io/github/stormpath/stormpath-sdk-node?branch=master)

## What Is This Library?

This is a library that you will use in your Node.js server applications.
This library is a wrapper for the Stormpath REST API.  It is a collection of
methods that allow you to create, modify, and update resources in the REST API,
without having to manually make HTTP calls from your own code.

## When Should I Use This Library?

You should use this library when you need to work directly with the Stormpath
REST API, but you don't want to manually construct the necessary HTTP requests.
Some example cases are:

* I need to get a list of all the accounts in my Stormpath Tenant.

* I need to manually create accounts in a Directory.

* I need to create a mapping between an Application and an Account Store.

## What Can't I Find Here?

This SDK is a low-level tool for working with the Stormpath REST API.  It won't
necessarily help you understand all the authentication and authorization features
that Stormpath provides.  If you are just getting started with your application
and you would like some high-level guidance on how to think about authentication
and authorization in your application, we recommend the [Stormpath Product Guide][].

Once you are familiar with the core concepts of Stormpath, it will be much
easier to find the parts of this library that will help you with your use-case.

## Is There An Easier Library?

Yes! If you use Express.js we have a deep integration that will
serve Login & Registration pages for you, as well as many other default features
that you would expect from a user management plugin.  Please head over to
[express-stormpath][] module to learn more.

NOTE: The [express-stormpath][] module depends on this library, and makes it
available to your Express application, so all the features of this library are
still made available to you.

## Where Do I Start?

Everything starts with a {@link Client} instance, which you create like so:

```
// Assumes API keys are in environment variables, or stormpath.yaml

var stormpath = require('stormpath');

var client = new stormpath.Client();
```

The client will require you to provide an API Key Pair, to secure the communication
with the Stormpath REST API.  There are several ways to configure this, and you
can read about it in the {@link Client} section.

Once you have your client instance, you can use it to start working with the
REST API:

```
// Fetch all the accounts in my Stormpath Tenant

client.getAccounts(function(err, accountsCollection) {
  accountsCollection.each(function(account, next) {
    console.log(account);
    next();
  });
});
```

## How Do I Get Help?

We're here to help if you get stuck.  There are several ways that you an get in
touch with a member of our team:

* Send an email to [support@stormpath.com](mailto:support@stormpath.com)
* Open a Github Issue on this repository: [https://github.com/stormpath/stormpath-sdk-node](https://github.com/stormpath/stormpath-sdk-node)
* Join us on our Slack channel: [https://talkstormpath.slack.com](https://talkstormpath.slack.com)

[Stormpath Product Guide]: https://docs.stormpath.com/rest/product-guide/latest/
[express-stormpath]: https://docs.stormpath.com/nodejs/express/latest/