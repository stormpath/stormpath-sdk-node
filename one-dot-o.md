# 1.0 Breaking changes list

An ongoing list of API cleanup that we need to do in our 1.0 release.

## Error handling

* err.userMessage should be err.message, there isn't a good reason to rename this property.

## Application API:

* Do not use encodeURIComponent() for the state param when creating ID Site JWT requests.

* I would like to rename Application.getAccount() -> Application.getProviderAccount()

## Account Store Mappings

* Need to remove "getApplication" from the base AccountStoreMapping, it now exists on ApplicationAccountStoreMapping

* Remove "setApplication" as that's not necessary

* setDefaultAccountStore should only accept an object with an href property.

* addAccountStore needs to be removed, in favor of createAccountStoreMapping

## API Authentication

* We will no longer support access tokens in the URL, we will only accept it in the Authorization header

* Scope factory should return a string, not an array

* "Granted Scopes" on client credentials authentication result should be a string

## Client Constructor:

The client constructor is confusing, as we accept the entire stormpath configuration
object. As such, to manually specify an API Key ID and Secret, you need to
do the following:

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

## Caching

We should remove the dependency on Redis and Memcached, and instead expect that
the developer will give us a configured client for the store of their choice. As
such, the configuration would become much simpler and would look like this:

```

var redis = require("redis");
var redisClient = redis.createClient();

var cacheOptions = {
  store: {
    type: 'redis',
    client: redisClient // now a required property
  },
  ttl: 300,
  tti: 300
};

var client = new stormpath.Client({
  cacheOptions: cacheOptions
});
```

## ApiKey

When fetching ApiKeys we are automatically expanding the account, see
ApiKeyEncryptedOptions.  This does not appear to be necessary, and the result
is an object-literal `account` object that exists on instances of ApiKey.  We
should remove this expansion, and implement `getAccount()` on the ApiKey
resource.

## OAuth

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

## Miscellany

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

## Need to implement

* AccessToken.getAccount()
* AccessToken.getRefreshToken()

## Bugs

* Expanded groups are not cast as CollectionResource type, account.groups becomes
  a generic object.  I think <reource>.<collection> should become an interable interface.

## Todo

* Continue defining what the OAuth and Authenticator interfaces should look like.

* Determine if per-region cache settings are available and if not, do we have to break to get them.

* Document timeout options for the request library

* Re-arrange methods to be alphabetical in individual files