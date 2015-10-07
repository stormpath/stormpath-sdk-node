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

<a name="getAccessToken"></a>
### <span class="member">method</span> getAccessToken()

Use this method to get a compacted JSON Web Token.  This token can be given to the
client who has authenticated, and can be used for subsequent autentication attempts.

The token is tied to the application which generated the authentication result and
contains a `sub` field that indicates if this token was created by an API Key exchange (the sub
will be the href of the API key)
or a username/password exchange (the sub will be the account href)

By default the token is valid for one hour.  If you need to change this value you
should use the `getJwt()` method and configure the JWT before compacting it.

**Example**:

````javascript
// Get the compacted JWT as a base64 encoded token

var accessToken = authenticationResult.getAccessToken();
````


---

<a name="getAccessTokenResponse"></a>
### <span class="member">method</span> getAccessTokenResponse([jwt])

Use this method to generate an Oauth-compatible response body.

You may pass an existing JWT instance, or allow it to create a JWT with
the same claims as `getAccessToken()`.  It will return a JSON object that
can be devliered as an HTTP response.  The format of the object is
`tokenResponse`, see below.

**Example**:

````javascript
// Get the compacted JWT as a base64 encoded token

var responseBody = authenticationResult.getAccessTokenResponse();
````


---

<a name="getJwt"></a>
### <span class="member">method</span> getJwt()

This method returns a JWT instance (from the
[nJwt](https://github.com/jwtk/njwt) library) which is pre-configured with the
same claims that you would get from calling `getAccessToken()`.  This method
exists in case you need to make more modifications to the JWT before you
compact it to an access token

**Example**:

````javascript
var jwt = authenticationResult.getJwt();

jwt.setExpiration(new Date('2015-07-01')); // A specific date
jwt.setExpiration(new Date().getTime() + (60*60*1000)); // One hour from now

// Compact the JWT to a base64 encoded token

var accessToken = jwt.compact();
````


---

<a name="tokenResponse"></a>
### <span class="property">property</span> .tokenResponse <em>Object</em>

Exists if the authentication result was created for an Oauth Access Token request, you should send this value as a `application/json` response to the requestor:

#### Format

```javascript
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc ...",
  "expires_in": 3600,
  "token_type": "bearer",
  "scope": "given-scope"
}
```

---

<a name="grantedScopes"></a>
### <span class="property">property</span> .grantedScopes <em>Array</em>

Exists if the authentication result was created from a previously issued Oauth Access Token which has granted scopes, it will be an array of strings which are the granted scopes.

#### Format

```javascript
['scope-a','scope-b']
```
