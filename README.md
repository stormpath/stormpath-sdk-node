# Official Stormpath SDK for Node.js [![Build Status](https://secure.travis-ci.org/stormpath/stormpath-sdk-node.png?branch=master)](http://travis-ci.org/stormpath/stormpath-sdk-node)

Copyright &copy; 2014 Stormpath, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).

For additional information, please see the [Stormpath Node.js API Documentation](http://docs.stormpath.com/nodejs/api).

## Install

```bash
npm install stormpath
```

## Quickstart

The Quickstart is on the front page of the [Stormpath Node.js API Documentation](http://docs.stormpath.com/nodejs/api).

## Change Log

### 0.1.0

Our first Node.js SDK release!

All functionality compared to our other SDKs is present _except_:

* More robust [CustomData](http://docs.stormpath.com/rest/product-guide/#custom-data) support.  You can create and update an account's or group's custom data as part of the account or group creation or update request - you just can't manipulate and save the custom data by itself (i.e. `customData.save()` won't work, but `account.save()` will).

* Caching implementations for network-accessible stores like Memcache and Redis.  A local in-memory (non clustered) cache mechanism is in place however.

* Exhaustive documentation.  We think that the docs we have in place right now are pretty awesome and should cover most needs.  However, we want to finish out any remaining missing docs before the next release.

* Exhaustive tests.  While we have been running integration tests regularly, the test coverage can be much better.  We already have 100% coverage on some core internals (like the `DataStore` and `RequestExecutor`), so we're confident with most of the implementations - enough to cut a release.  We will be finishing these entirely however in upcoming releases.

We're already actively working on a follow-up 0.2 release, but in the spirit of 'release early, release often', we wanted to get what we had out the door today to receive community feedback - please let us know your thoughts!

Send us an email to support@stormpath.com or open up a Pull Request and offer suggestions!

## Building

```bash
grunt
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
