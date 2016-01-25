## AsssertionAuthenticationResult

An `AsssertionAuthenticationResult` is returned by the [StormpathAssertionAuthenticator](stormpathAssertionAuthenticator).
It encapsulates an authentication result from ID Site Callback or SAML Callback, and allows you to get the account that has authenticated.

**Since**: 0.16.0

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(*[options,]* callback)

Retrieves the [Account](account) object of the user that has authenticated.

#### Usage

```javascript
asssertionAuthenticationResult.getAccount(function(err, account) {
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

void; the retrieved [Account](account) resource will be provided to the `callback` as the callback's second parameter.

---

<a name="stormpath_token"></a>
### <span class="property">property</span> .stormpath_token <em>String</em>

The original JWT that was returned to your application, as the `?jwtResponse=<stormpath_token>` parameter.

---

<a name="expandedJwt"></a>
### <span class="property">property</span> .expandedJwt <em>Object</em>

The parsed `stormpath_token`.