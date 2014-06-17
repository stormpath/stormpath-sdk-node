## OauthAuthenticationResult

An OauthAuthenticationResult is returned when a call to [application.authenticateApiRequest()](application#authenticateApiRequest) has found a valid `access_token` in the request

**Since**: 0.3.0

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(*[options,]* callback)

Retrieves the [Account](account) that was authenticated and provides it to the specified `callback`.

#### Usage

```javascript
oauthAuthenticationResult.getAccount(function(err, account) {
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

---


<a name="getScopes"></a>
### <span class="member">method</span> getScopes()

Retrieves the scopes for which the user is authorized.  These were set when the token was issued by making a call to [OauthAccessTokenResult.addScope()](oauthAccessTokenResult#addScope) before issuing the token to the user.


#### Usage

```javascript
var scopes = oauthAuthenticationResult.getScopes();

if(scopes && scopes[0]==='someProtectedResource'){
  // the user was authorized for this scope at the time that the token was issued
  // you can now trust that they have access to the resource which is identified by this scope
}
```

#### Parameters

This method does not take any parameters

#### Returns

An array of strings

---

<a name="getToken"></a>
### <span class="member">method</span> getToken()

Returns the raw JWT token that was supplied as a string in the http request via the `access_token` parameter.


#### Usage

```javascript
var token = oauthAuthenticationResult.getToken();
console.log(token);
// "eyJhbGciOiJIUzI1NiIsI ..."
```

#### Parameters

This method does not take any parameters

#### Returns

A string

---

<a name="getJwt"></a>
### <span class="member">method</span> getJwt()

Returns the decoded JWT token as an object.

#### Usage

```javascript
var jwtObject = oauthAuthenticationResult.getJwt();
console.log(jwtObject);

/*
{
  "iss": "https://api.stormpath.com/v1/applications/6hwkercPB1ZWr4zSO5zsbX",
  "iat": 1402750564,
  "sub": "DDDWT19S6TGAW8R6ZTJXMF12X",
  "exp": 1402754164,
  "scope": "scope1 scope2"
}
*/

```

#### Parameters

This method does not take any parameters

#### Returns

An object