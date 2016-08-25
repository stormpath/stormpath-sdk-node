# Stormpath Node SDK Roadmap

This is a working document while we plan our way to the next major release.  It is a proposal of future changes in this library.

### Wishlist items that need to be designed

- Better collection interfaces, make it easier to paginate, consider generator support

- Ability to cache account group resources - make it easy to white-list regions (URL pattern matches) for caching.

- Continue defining what the OAuth and Authenticator interfaces should look like.


## Next patch version:

- No planned changes

## 0.19.0 (Next Minor)

This is a rough list for now:

- Add any missing methods that should already exist on resources, so far I have found:
  
  - AccessToken.getAccount()
  - AccessToken.getRefreshToken()

- Add notice about discontinuing support for Node.js < 4.4.5

- Add deprecation notices for methods that will go away in 1.0

- Fix the SAUTHC1 authenticator

- Refactor the client credentials workflow to use the REST API

- Provide the ability to add custom claims to JWTs by creating a new JWT and signing it with the same API key.

- Implement eslint in tests



## 1.0 (Next Major)

Themes of this major version:

- Deprecate old node versions
- Clean up our public API, weed out inconsistencies in method signatures and response format types.
- Refactor our OAuth authenticators to be easier to use

### Meta

Drop support for Node.js < 4.4.5

### Error handling

* `err.userMessage` should be `err.message`, there isn't a good reason to rename this property.

### Application API:

* Do not use `encodeURIComponent()`` for the state param when creating ID Site JWT requests (`createIdSiteUrl`).  The state value should be left as-is, the nJwt library will do the necessary encoding of the final compact token.

* I would like to rename Application.getAccount() -> Application.getProviderAccount()

### Account Store Mappings

* Need to remove "getApplication" from the base AccountStoreMapping, it now exists on ApplicationAccountStoreMapping

* Remove "setApplication" as that's not necessary

* setDefaultAccountStore should only accept an object with an href property.

* addAccountStore needs to be removed, in favor of createAccountStoreMapping

### API Authentication

* We will no longer support access tokens in the URL, we will only accept it in the Authorization header

* Scope factory should return a string, not an array

* "Granted Scopes" on client credentials authentication result should be a string

### Client Constructor:

The client constructor is confusing, as we accept the entire Stormpath configuration object. As such, to manually specify an API Key ID and Secret, you need to do the following:

```
new stormpath.Client({
  client: {
    apiKey: {
      id: 'xxx',
      secret: 'xxx'
    }
  }
});
```

Because the client construction will never use the sibling properties of
`stormpath.web` and `stormpath.application`, we should only accept values that
can be defined by `stormpath.client`, and as such the client construction will
look like this:

```
new stormpath.Client({
  apiKey: {
    id: 'xxx',
    secret: 'xxx'
  }
});
```

Or this:

```
new stormpath.Client({
  apiKey: {
    file: 'xxx'
  }
});
```

### Caching

We should remove the dependency on Redis and Memcached, and instead expect that
the developer will give us a configured client for the store of their choice. We should also modify the configuration map to match what is in the SDK Spec:


https://github.com/stormpath/stormpath-sdk-spec/blob/master/specifications/config.md#default-configuration

As such, the configuration of a basic Redis cache manager, with some overrides of the default timeout values, would look like this:

```javascript

var redis = require("redis");
var redisClient = redis.createClient();

var cacheManagerOptions = {
  defaultTtl: 123, // seconds
  defaultTti: 456
};

var redisCacheManager = new stormpath.RedisCacheManager(redisClient, cacheManagerOptions)

var client = new stormpath.Client({
  cacheManager: redisCacheManager
});
```

If I want to disable caching entirely:

```javascript

var client = new stormpath.Client({
  cacheManager: {
    enabled: false
  }
});
```

If I want to modify the timeouts of the default in-memory cache:

```javascript

var client = new stormpath.Client({
  cacheManager: {
    defaultTtl: 60
  }
});
```

If I want to configure different timeouts for different regions on a redis cache:

```javascript
var cacheManagerOptions = {
  defaultTtl: 60, // seconds
  caches: {
    account: {
      ttl: 300
    },
    application: {
      ttl: 1440
    }
  }
};

var redisCacheManager = new stormpath.RedisCacheManager(redisClient, cacheManagerOptions)
```

Given all these requirements, the `stormpath-config` library needs to consider the following when parsing the `cacheManger` property during client construction:

- Is it an instance of `CacheManager` ? If so, keep that reference, and the client will use it when constructing a `DataStore`.
- Is it's not an instance of `CacheManager`, then assume it's an object-literal configuration map, and apply our standard extend/clone procedure for configuration.  The Client will use this map to configure a default in-memory store.

### ApiKey

When fetching ApiKeys we are automatically expanding the account, see
ApiKeyEncryptedOptions.  This does not appear to be necessary, and the result
is an object-literal `account` object that exists on instances of ApiKey.  We
should remove this expansion, and implement `getAccount()` on the ApiKey
resource.  This is consistent with the way we handle account getting on other response types.

### OAuth

* The class `JwtAuthenticationResult` should be removed, in favor of `OAuthPasswordGrantAuthenticationResult`.

* Keep `OAuthPasswordGrantAuthenticationResult`, but clean it up like so:

 * Remove the `accessTokenResponse` property, and move the properties of this
   object (which is the raw data from the API response) to be the root-level
   properties of `OAuthPasswordGrantAuthenticationResult`.
 * Remove all over top level properties that did not come from the API response.
 * `getAccount()` should still exist, and can reach into the access token to
   determine the href of the account
 * Add `getStormpathAccessToken()`, which will fetch the access token resource.
 * Add `getStormpathRefreshToken()`, which will fetch the refresh token resource.

* Add `getAccount()` to both AccessToken and RefreshToken resources, also add
  `getRefreshToken()` to AccessToken

* Implement OAuthClientCredentialsAuthenticationResult, which is going to look very much like OAuthPasswordGrantAuthenticationResult

* Remove OAuthIdSiteTokenGrantAuthenticator, replcaed by OAuthStormpathTokenAuthenticator

* OAuthRefreshTokenGrantAuthenticationResult and JwtAuthenticationResult become OAuthAccessTokenResult

* Remove application.authenticateApiRequest() in favor of the above methods

### Miscellany

* `Stregnth` should be renamed to `PasswordStrengthPolicy`, and PasswordPolicy.getStrength() should be getPasswordStrengthPolicy()

* Remove jwt-simple library (some default error messages, for token validation, will change)

* Remove client.createDirectories() and client.createApplications(), these are not necessary.

* Remove these methods in DataStore, they are not used:
 * DataStore.orderBy()
 * DataStore.expand()
 * DataStore.search()
 * DataStore.lean()

* Deprecate string option for application.sendPasswordResetEmail()

* Application.getDefaultAccountStore is not properly named (see description)

* Refactor setDefaultAccountStore and setDefaultGroupStore on Application and Organization, as that's massively not DRY right now.

* Add a client.verifyAccountEmail proxy for tenant.verifyAccountEmail

* Remove InstanceResource.get() as it does not appear to be used.

* InstanceResource.prototype.invalidate should be returning errors, it's not our choice to ignore these.

* StormpathAssertionAuthenticator() should take an API Key Pair as an optional second arguemnt.

### Bugs

* Expanded groups are not cast as CollectionResource type, account.groups becomes a generic object.  I think <resource>.<collection> should become an iterable interface.
* Actually, expanded resources don't ever appear to be cast as their type.

### Refactoring

* I've been been omitting the fact that a Resource will extend InstanceResource, because not all resources have the same abilities, e.g. some can be saved, some can be deleted.  We should reactor our prototypes to make it easier to mix methods together, and allow documentation to follow this path via @augments annotations.

* Re-arrange methods to be alphabetical in individual files

### Request Executor

At the moment, you can configure the request executor by adding options to the root object that you pass as client configuration:

```javascript
var client = new stormpath.Client({
  timeout: 30000 //milliseconds
});
```

This is valid because it's an option that the underlying `request` library supports.  This is a side-effect of the the way that we parse configuration, this wasn't actually intended to work this way.  We need to ensure that the request executor can be configured with this option map:

```yaml
stormpath:
  client:
    connectionTimeout: 30 # seconds
    authenticationScheme: "SAUTHC1"
    proxy:
      port: null
      host: null
      username: null
      password: null
```

The request executor should then map these properties on to the  `request` library.  

### Todo


* Determine if per-region cache settings are available and if not, do we have to break to get them.

