# stormpath-sdk-node Change Log

### 0.18.5

**Released August 11, 2016**

* Updated production dependencies:

 * `stormpath-config@0.0.23` -> `stormpath-config@^0.0.24`

**Released July 20, 2016**

### 0.18.4

* Fixed the client constructor to properly accept configuration loader instances
  that are passed into this library.  Fixes stormpath/express-stormpath#463.

* Updated production dependencies:

 * `async@1.5.0` -> `async@1.5.2`
 * `moment@2.13.0` -> `moment@2.14.1`
 * `njwt@0.2.2` -> `njwt@0.3.1`
 * `redis@2.5.1` -> `redis@2.6.2`
 * `request@2.72.0` -> `request@2.73.0`

### 0.18.3

**Released June 22, 2016**

* `Tenant.verifyAccountEmail()` will now evict the account from the cache before
  the operation.  Previously it would replace the cache entry after the
  operation, which can be problematic (stormpath/express-stormpath#448).

* Fixed bug where `Organization.save()` would error if custom data had been
  expanded (#455).

* Updated production dependencies:

 * `memcached@2.2.1` -> `memcached@2.2.2`
 * `moment@2.12.0` -> `moment@2.13.0`
 * `request@2.69.0` -> `request@2.72.0`

### 0.18.2

**Released March 24, 2016**

Fixing a bug with the `JwtAuthenticator`.  If the local validation option was
specified, and you gave it a JWT that was created by the client-credentials
workflow, the `getAccount()` method would fail because the authentication result
has an incorrect reference for the account HREF.  This bug was introduced in
0.18.0 but is now fixed in this patch release.

### 0.18.1

**Released March 23, 2016**

* Updated development dependencies:

 * `expand-home-dir@0.0.2` -> `expand-home-dir@0.0.3`

### 0.18.0

**Released March 14, 2016**

* Added an `invalidate()` method to resource objects.  This method will purge
  the resource from the cache.

* The `JwtAuthentictor` will now authenticate access tokens that have been
  created by the client_credentials workflow.  Previously it would only
  authenticate access tokens that were created by the password grant workflow.

* Fixed: when calling `account.save()`, errors were swallowed.  They are now
  passed to the callback, as expected.

### 0.17.5

**Released March 2, 2016**

* Updated dependency `stormpath-config` from version `0.0.20` to `0.0.22`.

### 0.17.4

**Released February 22, 2016**

Internal change, on the request executor, to allow other Stormpath modules to
set the User-Agent on a per-request basis.

### 0.17.3

**Released February 19, 2016**

Fixed the `baseUrl` option as used with `stormpath.Client({ baseUrl: 'xx'})`.
Previously this option would cause an exception in the request executor, making
it impossible to use an alternate base URL.

### 0.17.2

**Released February 18, 2016**

* Updated production dependencies:

 * `stormpath-config@0.0.18` -> `stormpath-config@0.0.20`
 * `nock@7.0.2` -> `nock@7.2.1`

### 0.17.1

**Released February 5, 2016**

* Fixed: the `JwtAuthenticator` would throw errors during token validation.  It
  now calls the provided callback instead.

* Removed un-used dependencies `flat` and `glob`.

### 0.17.0

**Released February 4, 2016**

* Added the new `OAuthStormpathTokenAuthenticator`, this authenticator can be
  be used to exchange Stormpath assertion tokens for an OAuth2 Access Token and
  Refresh Token.  Stormpath assertion tokens are JWTs that are provided on
  callback from ID Site or SAML providers.

* Adding deprecation notice for `OAuthIdSiteTokenGrantAuthenticator`, please use
  the new `OAuthStormpathTokenAuthenticator` instead.

* Added the following methods to the Organization resource:
 * createAccount()
 * createAccount()
 * getAccounts()
 * getCustomData()
 * getDefaultAccountStore()
 * getDefaultGroupStore()
 * getGroups()
 * getIdSiteModel()

* Internal refactor of argument parsing logic for all callback-based functions.


* Updated production dependencies:

 * `deep-extend@0.4.0` -> `deep-extend@0.4.1`
 * `underscore.string@3.2.2` -> `underscore.string@3.2.3`
 * `request@2.67.0` -> `request@2.69.0`
 * `lodash@4.0.0` -> `lodash@4.0.1`

### 0.16.0

**Released January 22, 2016**

* SAML Support!  Please see the documentation of the `SamlIdpUrlBuilder`, for
  initiating SAML redirects, and `StormpathAssertionAuthenticator`, for
  consuming the callback assertion token from Stormpath.  Application resources
  now have a `getSamlPolicy()` method, and `directory.getProvider()` will return
  a `SamlProvider` instance if the directory is a SAML directory.

* Improved error messages from our HTTP Request executor, to give better insight
  on network failures between your application and our REST API.

### 0.15.5

**Released January 21, 2016**

* Fixed: `collection.every(iterator, callback)`.  The callback was being invoked
  on every page request to the API (it should only be called once the entire
  collection has been paginated).  The iteration wouldn't be aborted if the
  iterator returned `false`.  This is now fixed.

* Tests have been improved for readability.

* Test runner has been fixed, all unit tests are now running.

### 0.15.4

**Released January 13, 2016**

* Upgraded `stormpath-config` to v0.0.18. Contains fix for when
  absolute path is provided but home environment isn't set.

### 0.15.3

**Released January 13, 2016**

* Upgraded `stormpath-config` to v0.0.17. Contains fix for when home
  environment isn't being set.

### 0.15.2

**Released December 18, 2015**

* Upgrade `stormpath-config` to `0.0.16`.

* Scope factory, for client_credentials workflow, can now be asynchronous.

### 0.15.1

**Released December 8, 2015**

* Updating production dependencies:

  * jwt-simple-0.4.0
  * memcached@2.2.1
  * redis@2.4.1
  * stormpath-config@0.15.0

The upgrade to `stormpath-config` includes a fix for a bug with
`client.cacheOptions.client`, where the client prototype was being mutated
(resulting in an undefined method exception if you attempted to provide your
own Redis client).


### 0.15.0

**Released November 20, 2015**

* Updating this module's configuration strategy to not enrich the client with
  application data, that is now moved into the `express-stormpath` module.

* Updating these non-development dependencies:

  * stormpath-config@0.13.0
  * request@2.67.0
  * properties-parser@0.3.1
  * node-uuid@1.4.7

### 0.14.0

**Released November 12, 2015**

- Implemented the ID Site Token Authenticator, allowing you to exchange and ID
  Site Result JWT for a Stormpath Access Token (documentation coming soon).

- Implemented `client.getRefreshToken()` for fetching refresh token resources.

- Fixed: using local validation with the JWT authenticator would throw an
  exception because the account property was not defined on the authentication
  result object.

- Updated `glob` dependency to 6.0.1

### 0.13.5

- Fixed OAuth error responses to include the error code `invalid_client`, where appropriate.
- Updated dependencies (see latest package.json).
- Test improvements (cleaning up IT resources, caching client for speed).

### 0.13.4

- Refactor: DataStore and RequestExecutor now uses `options.client.apiKey` instead of `options.apiKey`.

### 0.13.3

- Fixed: Old environment variables (STORMPATH_API_KEY_ID and
  STORMPATH_API_KEY_SECRET) were not being read.  They are now being read again
  for backwards compatibility.
- Fixed: OAuthAuthenticator was not passing local validation option to the
  JwtAuthenticator.

### 0.13.2

- Changed: Config files are now loaded before environment config.
- Fixed: Error: API key ID and secret is required.
- Fixed: Passing Redis client to config causes "Maximum call stack size exceeded" with deep-extend.

### 0.13.1

Moving `lodash` to dependencies, it was incorrectly placed in the dev dependencies

### 0.13.0

- Configuration is now loaded all async.
- Added tests for configuration.
- Added getters and setters for access tokens and refresh tokens.
- Added `Account.getAccessTokens()`, `Client.getAccessToken()`, and `Account.getRefreshTokens()`.
- Fixed TTL bug in `AuthenticationResult.getJwt()`

### 0.12.2

- Supporting LinkedIn configuration options.

### 0.12.1

- Fix: enable the `/me` route if the `website` option is used in the config parser

### 0.12.0

#### Organization Support

This SDK now supports the new Organization Resource in Stormpath.  Create
Organizations through the Client, and create Organization Account Store Mappings
through an Organization instance.

`Application.createIdSiteUrl` now has more options that allow you to enable
Organization features on ID Site sessions.

Please see the documentation for more information.

### 0.11.5

- Adding tests for Config.

### 0.11.4

- Updating API docs -- fixing bugs, cleaning up code samples, etc.
- Adding tests for `Application.getAccount()`.
- Improved error handling for `Application.getAccount()` so it can't be used
  improperly.
- Removing `resource.customData.get` -- use `resource.getCustomData` instead =)
  This wasn't used anywhere anyhow: so this doesn't need to be a major version
  upgrade.
- Adding tests to ensure URI fragments can be retrieved (*they can*).

### 0.11.3

- Fixing issue with null request bodies when using our `AuthRequestParser`
  class.
- Adding tests for `AuthRequestParser` class.
- Adding support for Node 0.11, 0.12, and iojs.  Yey!

### 0.11.2

- Modifying our test runner.  If you run `npm test`, all tests will be ran --
  not just the mocks.
- Removing a dependency on the `$HOME` environment variable being set.  It now
  works without it =)
- Making our tests publish coverage results to coveralls.io.
- Adding a coverage badge to the `README.md`.
- Fixing issue with customData field removal.  Previously if you tried removing
  the last customData field, it would error out.

### 0.11.1

Adding configuration options `web` and `api`.  These are to be consumed
by a framework integration, and indicate which features to enable by default

### 0.11.0

* Supporting OAuth Password Grant flow, using api.stormpath.com as the data store

* Supporting new configuration format, for web framework integrations

### 0.10.2

* Ignoring `.env` files so they don't end up in the npm artifacts.
* Adding new config parsing logic.  This will parse a `config.json` file.  This
  will be used in the upcoming major release, to supply options in a new manner.

### 0.10.1

Client constructor now accepts `baseUrl` as an option, allowing you to change
the base URL from `'https://api.stormpath.com/v1'` to a custom value.

### 0.10.0

* The client constructor now allows you to specify the `apiKeyEncryptionOptions` option.
This allows you to configure how Account API Keys are encrypted before being stored
in the local cache.

* Updated `application.sendPasswordResetEmail()` to to accept an `accountStore` property,
for defining which account store to search for the given `email`


### 0.9.3

Fixed `Application.authenticateApiRequest` to also accept access tokens where
the subject is an Account, rather than an API Key.

### 0.9.2

Fixed: do not cause exceptions when error response body is null.

### 0.9.1

Add `.npmignore` to exclude docs, samples, and test from the npm distribution.  Thanks @coreybutler

### 0.9.0

Add these methods to `AuthenticationResult` to support token creation for Api Keys or Accounts:

* `getJwt()` - returns a `Jwt` instance with a pre-configured body that is set to the appropriate defaults.  Also sets the signing key to the api key secret of the current Stormpath client.

* `getAccessToken([jwt])` - calls `jwt.compact()` on the given `jwt`, or a default `jwt` constructed by `getJwt()`

* `getAccessTokenResponse([jwt])` - constructs an Oauth-compatible response body from the given `jwt`, or a default `jwt` constructed with `getJwt()`

The `Jwt` instances are provided by the [nJwt Library](https://github.com/jwtk/njwt)

### 0.8.1

Cache fix: preserve hrefs of linked resources in the cache entity, but not the properties.
This allows getter methods to resolve the linked resource at a later time.

### 0.8.0

Fixed these caching problems:

* Touching items in the cache when we don't need to (thanks [philipatkinson](https://github.com/philipatkinson))
* When requesting a collection the individual resources in the collection were not being put into their respective cache regions
* When requesting a resource with expanded resources, the expansions were not being cached
* When requesting a resource with an expanded collection, the resources in the collection were not being cached

Improvements:

* Support the passing of client instances for Redis and Memcached, this allows you to share
one connection to your store for all Stormpath cache regions (thanks [philipatkinson](https://github.com/philipatkinson))

### 0.7.5

* Fixing bug with `GroupMemnberships.getAccount()`.

### 0.7.4

* Implement `application.resendVerificationEmail()`

### 0.7.3

* Add cache region for Custom Data resources.  Thanks [alavers](https://github.com/alavers) for finding this issue.

### 0.7.2

* Add methods `Tenant.getAccounts()` and `Tenant.getGroups()`, use these to fetch
all accounts or groups within your tenant.

### 0.7.1

* Remove improper use of `_.pluck` in `CustomData.prototype._hasReservedFields` (thanks [sojournerc](https://github.com/sojournerc))

### 0.7.0

* Fixing the status codes (400 vs 401) on errors thar are returned from `authenticateApiRequest`
* Upgrading the Redis dependency to ~0.12.1 and fixing constructor options accordingly

### 0.6.0

#### Custom Data Improvements ####

Custom Data is now available on Applications, Groups, Directories, and the Tenant!  We're
really excited about this improvment and the power it gives you for storing data on
Stormpath resources.

Simply call `getCustomData()` on any of these resources and start using the custom data
object like you have been with Accounts.  For more information please see the
[Custom Data documentation](http://docs.stormpath.com/nodejs/api/customData)

#### ID Site Improvements ####

We recently added Single Sign On (SSO) support to our
[ID Site Feature](http://docs.stormpath.com/guides/using-id-site)
and this SDK release adds
a `logout: true` option to the ` application.CreateIdSiteUrl([options],cb)` method.  When this
option is used  the user’s SSO cookie will be destroyed and the user will be immediately redirected
to the specified `callbackUri` where the `idSiteResult` has a new `status` property which will
be the value of `'LOGOUT'`

For more information see the
[createIdSiteUrl](http://docs.stormpath.com/nodejs/api/application#createIdSiteUrl)
and
[handleIdSiteCallback](http://docs.stormpath.com/nodejs/api/application#handleIdSiteCallback)
 method documentation.

#### Fixes ####

* Stop caching requests that have query params, fixes problems with resource
expansions (#85)
* Fix caching docs to show correct port and option names for Memcached (#73)
* Upgraded modules `properties-parser`, `request`, `moment`, `node-uuid` (#93)


### 0.5.2

Fix `authenticateApiRequest`, do not throw if the request is not GET or POST

### 0.5.1

Fix for case where `application.getAccount()` receives an error but still tries to read the undefined `account` object

### 0.5.0

#### Breaking Changes ####

* `application.authenticateApiRequest(options,cb)` now requires you to supply the request method as `options.request.method`
* OAuth token requests must use POST, see [RFC749 3.2](http://tools.ietf.org/html/rfc6749#section-3.2)

#### Fixes ####

* `authenticationResult` objects now include the granted scope on the object, see [RFC749 5.1](http://tools.ietf.org/html/rfc6749#section-5.1)
* Improve documentation of the `path` option for `application.createIdSiteUrl`

### 0.4.3

Cache fix that was preventing expanded resources from being cached

### 0.4.2

Fix the Oauth authenticator to provide `requestedScopes` and `grantedScopes` as an array of strings, not a single string.

### 0.4.1

Updated User-Agent string to be spec compliant and extendable

### 0.4.0

#### ID Site Functionality! ####

Your own hosted, white-labeled Identity Site, what we call an 'ID Site'!

You can have a 100% customizable white-labeled site, for example, `https://id.awesomeapp.com` or
`https://my.awesomeapp.com`, hosted and served securely by Stormpath.  Your ID Site provides your end-users with a
hosted and secure registration, login, and password reset functionality, and **completely hands-off integration with
Google and Facebook!**.

Your white-labeled ID Site is beautiful and 'just works' out-of-the box and requires no development effort, but if you
want to customize it in any way, you can easily fork our default GitHub repo and customize it as you desire, and we'll
serve your fork securely just the same.

All that is required for this to work is that your application redirects your end-user to your secure ID Site URL and,
when the user is done, can receive a redirect back to your application.  This 0.4.0 release includes two
additional functions so you don't have to code that yourself.

See the new **[createIdSiteUrl](http://docs.stormpath.com/nodejs/api/application#createIdSiteUrl)**
 method (for redirecting end-users to your ID Site) and the
**[handleIdSiteCallback](http://docs.stormpath.com/nodejs/api/application#handleIdSiteCallback)**
method (for handling the return reply from your ID Site) for code examples!

For a comprehensive overview of the ID Site feature, see the [ID Site Feature Guide](http://docs.stormpath.com/guides/using-id-site)

#### Improvements ####

  * When you call `save()` and `delete()` on any resource, the callback is now optional and can be omitted.
  * HTML/CSS layout improvements to the documentation app, it is now mobile friendly!
  * Several descriptive fixes to the documentation.

### 0.3.0

#### New Features

Secure your REST API using OAuth 2!

The Stormpath Node SDK can now act as an OAuth 2 Provider with full API Key management support!

You can now use the Node SDK to create and manage API Keys for your end-users so they can authenticate with your own REST API. You can create, delete, enable/disable as many API Keys as you want for each of your end-user Account resources. See the Account resource's createApiKey and getApiKeys methods.

Now for the really powerful stuff: the Stormpath Node SDK implements OAuth2 provider functionality. Your end-users can use these API Keys to make OAuth 2 requests to your REST API, and the Stormpath Node SDK will authenticate the requests via OAuth as you wish. This includes both OAuth 2 access token requests (e.g. the /oauth/token endpoint) as well as resource requests (e.g. /movies/1234). At no point do you ever need to see, touch, or write OAuth code! The Stormpath SDK does it for you.

See the Application resource's `authenticateApiRequest` method for detailed information.

#### Improvements

* You can use the new method `Application.resetPassword()` to validate a password reset token AND set a new password, with just one call to our API

* You can authenticate an account against a specific account store when calling `Application.authenticateAccount()`, this is a useful performance option if you have a large number of stores and you know which store the user is in.

### 0.2.0

Improvements:

* Support Redis and Memcahced as cache stores

* Social provider support for Google and Facebook

* Create, modify, delete Account Store Mappings

* Add iterator methods to collection resources

Fixes:

* Cache regions are now implemented

* `Tenant.verifyAccountEmail` returns an `Account` object, as expected

Breaking changes:

* `Cache` now takes an options hash instead of positional params


### 0.1.2

Fixed Readme to reflect 0.1.1 changes (this release does not affect code at all).

### 0.1.1

Minor bugfix [point release](https://github.com/stormpath/stormpath-sdk-node/issues?milestone=1&state=closed) that fixes a [bug](https://github.com/stormpath/stormpath-sdk-node/issues/11) where authentication fails when caching is enabled.

Also added a new [quickstart.js](https://github.com/stormpath/stormpath-sdk-node/blob/master/quickstart.js) file that reflects the Stormpath Node.js [Quickstart Documentation](http://docs.stormpath.com/nodejs/api/home).

### 0.1.0

Our first Node.js SDK release!

All functionality compared to our other SDKs is present _except_:

* More robust [CustomData](http://docs.stormpath.com/rest/product-guide/#custom-data) support.  You can create and update an account's or group's custom data as part of the account or group creation or update request - you just can't manipulate and save the custom data by itself (i.e. `customData.save()` won't work, but `account.save()` will).

* Caching implementations for network-accessible stores like Memcache and Redis.  A local in-memory (non clustered) cache mechanism is in place however.

* Exhaustive documentation.  We think that the docs we have in place right now are pretty awesome and should cover most needs.  However, we want to finish out any remaining missing docs before the next release.

* Exhaustive tests.  While we have been running integration tests regularly, the test coverage can be much better.  We already have 100% coverage on some core internals (like the `DataStore` and `RequestExecutor`), so we're confident with most of the implementations - enough to cut a release.  We will be finishing these entirely however in upcoming releases.

We're already actively working on a follow-up 0.2 release, but in the spirit of 'release early, release often', we wanted to get what we had out the door today to receive community feedback - please let us know your thoughts!

Send us an email to support@stormpath.com or open up a Pull Request and offer suggestions!
