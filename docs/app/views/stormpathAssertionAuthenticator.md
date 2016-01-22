## StormpathAssertionAuthenticator

Provides the ability to authenticate with Stormpath JWTs (`stormpath_token`).
Your application will recieve these tokens when a user is redirected to your application from a SAML provider, or from ID Site.
This token asserts the user that authenticated.

---


<a name="constructor"></a>
### <span class="member">constructor</span> StormpathAssertionAuthenticator(application)

Creates a new `StormpathAssertionAuthenticator` instance for the provided application.


#### Usage

```javascript
var authenticator = new stormpath.StormpathAssertionAuthenticator(application);
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

A new [`StormpathAssertionAuthenticator`](stormpathAssertionAuthenticator) instance.

---


<a name="authenticate"></a>
### <span class="member">method</span> authenticate(stormpath_token, callback)

Authenticates a `stormpath_token` and returns a [AssertionAuthenticationResult](assertionAuthenticationResult), which
can provide the [Account](account) that has authenticated.

The `stormpath_token` is the value of the `jwtResponse` parameter in the callback URL, e.g. `https://myapp.com/samlCallback?jwtResponse=<stormpath_token>`.


#### Usage

```javascript
authenticator.authenticate(stormpath_token, function(err, authenticationResult) {
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
      <td>`stormpath_token`</td>
      <td>`string`</td>
      <td>required</td>
      <td>A Stormpath JWT, from a ID Site Callback or SAML Callback.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](Error).  The 2nd parameter is an [AssertionAuthenticationResult](assertionAuthenticationResult) instance.</td>
    </tr>
  </tbody>
</table>


#### Returns

If the request fails, the callback's first parameter (`err`) will report the
failure.  If the request succeeds, a [AssertionAuthenticationResult](assertionAuthenticationResult) instance
will be provided to the callback as the callback's second parameter.
