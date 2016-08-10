# Stormpath Node.js SDK

[![NPM Version](https://img.shields.io/npm/v/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![NPM Downloads](http://img.shields.io/npm/dm/stormpath.svg?style=flat)](https://npmjs.org/package/stormpath)
[![Build Status](https://img.shields.io/travis/stormpath/stormpath-sdk-node.svg?style=flat)](https://travis-ci.org/stormpath/stormpath-sdk-node)
[![Coverage Status](https://coveralls.io/repos/stormpath/stormpath-sdk-node/badge.svg?branch=master&service=github)](https://coveralls.io/github/stormpath/stormpath-sdk-node?branch=master)

*A simple user management library for Node.js.*

This library is a wrapper for the [Stormpath][] REST API.  It is a collection of
methods that allow you to create, modify, and update resources in the REST API,
without having to manually make HTTP calls from your own code.

[Stormpath][] is a User Management API that reduces development time with instant-
on, scalable user infrastructure. Stormpath's intuitive API and expert support
make it easy for developers to authenticate, manage and secure users and roles
in any application.

This library provides low-level access to all of Stormpath's features, to name
a few:

- Robust authentication and authorization.
- Schemaless user data.
- Social login with Facebook and Google OAuth.
- Generate and manage API keys for your service.
- Stateless authentication with JWTs.

Because this library gives you basic low-level access to the REST API only, it
may not always be the best choice for the problem that you are trying to solve.
If you want to work with a more comprehensive framework integration, please see
the other libraries that are listed below.


## Documentation

This library is fully documented with JsDoc, please visit the site here:
[Stormpath Node.js SDK Documentation][]


## Install

```bash
npm install stormpath
```


## Usage

Everything starts with a [Client][] instance, which you create like so:

```
// Assumes API keys are in environment variables, or stormpath.yaml

var stormpath = require('stormpath');

var client = new stormpath.Client();
```

With a [Client][] instance, you can do many operations, like fetching all of the
accounts in your Stormpath Tenant:

```
// Fetch all the accounts in my Stormpath Tenant

client.getAccounts(function(err, accountsCollection) {
  accountsCollection.each(function(account, next) {
    console.log(account);
    next();
  });
});
```


## Other Libraries

This library is a low-level wrapper for the [Stormpath][] REST API.  We also
provide high-level libraries for popular frameworks, these libraries provide
default views for login and registration, as well as many other features for
adding authentication and authorization to your full-stack web or mobile
application.

- [Express-Stormpath][] - A deep integration with Express that will add default
  view for authentication, and provide a JSON API for front-end and mobile
  clients to use for authentication.

- [Stormpath Angular SDK][] - This library provides default login and registration
  views in your Angular application, and communicates with [Express-Stormpath][]
  via its JSON API to authenticate the user, and tell Angular about the logged-in
  user.  This library can be used with other back-end frameworks, for more
  integrations see https://docs.stormpath.com

- [Stormpath React SDK][] - This library provides routes and components for
  React that will allow you to solve common user management tasks using Stormpath,
  such as login and signup.  It communicates with [Express-Stormpath][] via
  its JSON API to authenticate the user and provide user context to your React
  application.  This library can be used with other back-end frameworks, for more
  integrations see https://docs.stormpath.com


## Tutorials

These guides will walk you through the creation of a full-stack JavaScript
application that uses Node.js:

- [API Key Management for Node – A Sample App](https://stormpath.com/blog/easy-api-key-management-for-node-a-sample-app-2)
- [Build an API Service with Oauth2 Authentication, using Restify and Stormpath](https://stormpath.com/blog/build-api-restify-stormpath)
- [Build an app with AngularJS, Node.js and Stormpath in 15 minutes](https://stormpath.com/blog/angular-node-15-minutes)
- [Build a React.js Application with User Authentication](https://stormpath.com/blog/build-a-react-app-with-user-authentication)
- [Build a REST API for Your Mobile Apps using Node.js](https://stormpath.com/blog/tutorial-build-rest-api-mobile-apps-using-node-js)
- [Build a Webapp with Node, Express, Bootstrap & Stormpath](https://stormpath.com/blog/build-nodejs-express-stormpath-app/)
- [Deploy Stormpath on Heroku with Express.js](https://github.com/stormpath/stormpath-heroku-express-sample)


## Support

We're here to help if you get stuck.  There are several ways that you an get in
touch with a member of our team:

* Send an email to [support@stormpath.com](mailto:support@stormpath.com)
* Open a Github Issue on this repository.
* Join us on our Slack channel: [https://talkstormpath.shipit.xyz/](https://talkstormpath.shipit.xyz/)

[Stormpath AngularJS SDK]: https://github.com/stormpath/stormpath-sdk-angularjs
[Stormpath Product Guide]: https://docs.stormpath.com/rest/product-guide/latest/
[Stormpath React SDK]: https://github.com/stormpath/stormpath-sdk-react
[express-stormpath]: https://docs.stormpath.com/nodejs/express/latest/


## Copyright

Copyright &copy; 2015 Stormpath, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).

[Client]: https://docs.stormpath.com/nodejs/api/client
[Express-Stormpath]: https://github.com/stormpath/stormpath-express
[Stormpath]: https://stormpath.com
[Stormpath Angular SDK]: https://github.com/stormpath/stormpath-sdk-angularjs
[Stormpath Node.js SDK Documentation]: https://docs.stormpath.com/nodejs/api/
[Stormpath React SDK]: https://github.com/stormpath/stormpath-sdk-react