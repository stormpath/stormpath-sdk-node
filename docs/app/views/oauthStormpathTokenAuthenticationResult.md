## OAuthStormpathTokenAuthenticationResult

An `OAuthStormpathTokenAuthenticationResult` is returned by the
[OAuthStormpathTokenAuthenticator](oauthStormpathTokenAuthenticator).
It encapsulates an authentication result from an ID Site or SAML callback, and
allows you to get the account that has authenticated.


---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(*[options,]* callback)

Retrieves the [Account](account) object of the user that has authenticated.

#### Usage

```javascript
oauthStormpathTokenAuthenticationResult.getAccount(function(err, account) {
  console.log(account);
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion).</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Account](account) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

If the request fails, the callback's first parameter (err) will report the failure. If the request succeeds, a [Account](account) instance will be provided to the callback as the callback's second parameter.
