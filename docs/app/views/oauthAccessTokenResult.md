## OauthAccessTokenResult

An oauthAccessTokenResult is returned when a call to [application.authenticateApiRequest()](application#authenticateApiRequest) has found valid HTTP Basic Auth credentials, and the user has also requested an Oauth token by specifying the `grant_type=client_credentials` parameter

You MUST return the value of `getTokenResponse()` as the response entity.

You MAY modify the scope of the token and it's expire time by making calls to `addScope()` and `setTtl()`, respectively, before the final call to `getTokenResponse()`.

**Since**: 0.3.0

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(*[options,]* callback)

Retrieves the [Account](account) that was authenticated and provides it to the specified `callback`.

#### Usage

```javascript
oauthAccessTokenResult.getAccount(function(err, account) {
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


<a name="addScope"></a>
### <span class="member">method</span> addScope(scopeString)

Add scope to this token, if desired.  Must be called before issuing the token.  By default no scope is set.  You may call this multiple times, each scope will be added to the final token as a space-seperated string.


#### Usage

```javascript
oauthAccessTokenResult.addScope('account');
oauthAccessTokenResult.addScope('profile');
```

#### Parameters

A single scope value, as a string, which identifies a resource for which this authenticated user is authorized to access.

#### Returns

Does not return a value.  The final token can be retrieved by calling `getToken`

---


<a name="setTtl"></a>
### <span class="member">method</span> setTtl(seconds)

Sets the time-to-live of this token, if desired.  Defaults to one hour (3600 seconds).  Must be called before issuing the token.

#### Usage

```javascript
oauthAccessTokenResult.setTtl(60); // this token will expire in one minute
```

#### Parameters

A number greater than zero.

#### Returns

Does not return a value.  The final token can be retrieved by calling `getToken`

---

<a name="setApplicationHref"></a>
### <span class="member">method</span> setApplicationHref(href)

The application which is issuing this token, should be the application which has access to the authenticated account.  This value is set as the `iss` value of the final JWT token.

This method is called automatically if you have recieved an `OauthAccessTokenResult` by calling [application.authenticateApiRequest()](application#authenticateApiRequest)

#### Usage

```javascript
oauthAccessTokenResult.setApplicationHref('http://api.stormpath.com/v1/applications/:appId'); // this token will expire in one minute
```

#### Parameters

The href of an application, as a string

#### Returns

Does not return a value.  The final token can be retrieved by calling `getToken`

---

<a name="getToken"></a>
### <span class="member">method</span> getToken()

Returns the enocded JWT as a string.


#### Usage

```javascript
var token = oauthAccessTokenResult.getToken();
console.log(token);
// "eyJhbGciOiJIUzI1NiIsI ..."
```

#### Parameters

This method does not take any parameters

#### Returns

A string

---

<a name="getTokenResponse"></a>
### <span class="member">method</span> getTokenResponse()

Returns an object which should be returned to the user if they request an Oauth token.

#### Usage

```javascript
var response = oauthAccessTokenResult.getTokenResponse();
console.log(response);

/*
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsI ...",
    "token_type":"bearer",
    "expires_in": 3600
  }
*/

```

#### Parameters

This method does not take any parameters

#### Returns

An object which should be returned to the user as an `application/json` response.