## StormpathAssertionAuthenticator

Provides the ability to authenticate with Stormpath JWTs (`stormpath_token`).

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
      <td>Stormpath [Application](application) to authenticate with.</td>
    </tr>
  </tbody>
</table>


#### Returns

A new [`StormpathAssertionAuthenticator`](stormpathAssertionAuthenticator) instance.

---


<a name="authenticate"></a>
### <span class="member">method</span> authenticate(stormpathToken, callback)

Authenticates a `stormpathToken` and calls the provided callback with the result.


#### Usage

```javascript
authenticator.authenticate(stormpathToken, function(err, authenticationResult) {
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
      <td>`stormpathToken`</td>
      <td>`string`</td>
      <td>required</td>
      <td>A Stormpath JWT (`stormpath_token`).</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](Error).  The 2nd parameter is an AssertionAuthenticationResult instance.</td>
    </tr>
  </tbody>
</table>


#### Returns

If the request fails, the callback's first parameter (`err`) will report the
failure.  If the request succeeds, a AssertionAuthenticationResult instance
will be provided to the callback as the callback's second parameter.
