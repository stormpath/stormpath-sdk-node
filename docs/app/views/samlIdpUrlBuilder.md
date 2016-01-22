## SamlIdpUrlBuilder

Provides the ability to build SAML IDP redirect URLs.  This is done when Stormpath is initiating a redirect to a SAML IDP.

For more informaiton, please see
[Authenticating Against a SAML Directory](http://docs.stormpath.com/rest/product-guide/latest/auth_n.html#authenticating-against-a-saml-directory).

---


<a name="constructor"></a>
### <span class="member">constructor</span> SamlIdpUrlBuilder(application)

Creates a new `SamlIdpUrlBuilder` instance for the provided application.


#### Usage

```javascript
var builder = new stormpath.SamlIdpUrlBuilder(application);
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
      <td>Stormpath [Application](application) that will issue the redirect.  This application must be mapped to the relevant SAML Directories.</td>
    </tr>
  </tbody>
</table>


#### Returns

A new [`SamlIdpUrlBuilder`](samlIdpUrlBuilder) instance.

---


<a name="build"></a>
### <span class="member">method</span> build(*[options,]* callback)

Builds a SAML IDP URL and provides it to the specified callback.


#### Usage

```javascript
builder.build(function(err, url) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(url);
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
      <td>
      Optional claims for the [SAML Authentication JWT](http://docs.stormpath.com/rest/product-guide/latest/auth_n.html#saml-authentication-jwt).
      Use these claims to control the callback url (`cb_url`), token state (`state`), and account store target (`ash` or `onk`).
      The required claims will be set automatically.
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](Error).  The 2nd parameter is an IDP redirect URL (`string`).</td>
    </tr>
  </tbody>
</table>


#### Returns

If the request fails, the callback's first parameter (`err`) will report the
failure.  If the request succeeds, a IDP redirect URL will be provided to
the callback as the callback's second parameter.
