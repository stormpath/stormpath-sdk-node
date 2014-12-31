# stormpath-sdk-node Change Log

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
