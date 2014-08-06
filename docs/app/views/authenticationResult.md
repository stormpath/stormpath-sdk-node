## AuthenticationResult

An AuthenticationResult is returned when an [application authenticates an account](application#authenticateAccount) successfully.

**Since**: 0.1.1

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(*[options,]* callback)

Retrieves the authentication result's corresponding successfully authenticated [Account](account) and provides it to the specified `callback`.

**Performance Tip:** The application [authenticateAccount](application#authenticateAccount) call will automatically request that the authenticated account be returned with the authentication result.  This means the `result.getAccount` call will not actually send a request to the server: the account will be returned immediately.

#### Usage

```javascript
result.getAccount(function(err, account) {
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

<a name="tokenResponse"></a>
### <span class="property">property</span> .tokenResponse <em>Object</em>

Exists if the authentication result was created for an Oauth Access Token request, you should send this value as a `application/json` response to the requestor:

#### Format

````javascript
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc ...",
  "expires_in": 3600,
  "token_type": "bearer",
  "scope": "given-scope"
}

````

---

<a name="grantedScopes"></a>
### <span class="property">property</span> .grantedScopes <em>Array</em>

Exists if the authentication result was created from a previously issued Oauth Access Token which has granted scopes, it will be an array of strings which are the granted scopes.

#### Format

````javascript
['scope-a','scope-b']
````
