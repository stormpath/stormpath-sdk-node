## OAuthStormpathTokenAuthenticator

Provides the ability to authenticate with Stormpath JWTs (`stormpath_token`).
Your application will recieve this token when a user is redirected to your
application from an ID Site or SAML provider.

---


<a name="constructor"></a>
### <span class="member">constructor</span> OAuthStormpathTokenAuthenticator(application)

Creates a new `OAuthStormpathTokenAuthenticator` instance for the provided application.


#### Usage

```javascript
var authenticator = new stormpath.OAuthStormpathTokenAuthenticator(application);
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
      <td>`application`</td>
      <td>[`Application`](application)</td>
      <td>required</td>
      <td>Stormpath [Application](application) to authenticate against.</td>
    </tr>
  </tbody>
</table>


#### Returns

A new [`OAuthStormpathTokenAuthenticator`](oauthStormpathTokenAuthenticator) instance.

---


<a name="authenticate"></a>
### <span class="member">method</span> authenticate(data, callback)

Authenticates a `stormpath_token` and returns a [OAuthStormpathTokenAuthenticationResult](outhStormpathTokenAuthenticationResult), which
can provide the [Account](account) that has authenticated.

The `stormpath_token` is the value of the `jwtResponse` parameter in the
callback URL, e.g. `https://myapp.com/idSiteCallback?jwtResponse=<stormpath_token>`.


#### Usage

```javascript
authenticator.authenticate(data, function(err, authenticationResult) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(authenticationResult);
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
      <td>`data`</td>
      <td>`object`</td>
      <td>required</td>
      <td>
        <p>An object literal, with the following properties:</p>
        <ul>
          <li>`stormpath_token` - REQUIRED - A Stormpath JWT from an ID Site or SAML callback.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](Error).  The 2nd parameter is an [OAuthStormpathTokenAuthenticationResult](oauthStormpathTokenAuthenticationResult) instance.</td>
    </tr>
  </tbody>
</table>


#### Returns

If the request fails, the callback's first parameter (`err`) will report the
failure.  If the request succeeds, a [OAuthStormpathTokenAuthenticationResult](oauthStormpathTokenAuthenticationResult) instance
will be provided to the callback as the callback's second parameter.
