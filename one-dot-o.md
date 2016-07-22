# 1.0 Breaking changes list

An ongoing list of API cleanup that we need to do in our 1.0 release.

## Error handling

* err.userMessage should be err.message, there isn't a good reason to rename this property.

## Application API:

* Do not use encodeURIComponent() for the state param when creating ID Site JWT requests.

* I would like to rename Application.getAccount() -> Application.getProviderAccount()

## Account Store Mappings

* Need to remove "getApplication" and "setApplication" from the base AccountStoreMapping, it now exists on ApplicationAccountStoreMapping

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

## Miscellany

* `Stregnth` should be renamed to `PasswordStrengthPolicy`, and PasswordPolicy.getStrength() should be getPasswordStrengthPolicy()