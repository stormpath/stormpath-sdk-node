## SamlIdpUrlBuilder

Provides the ability to build SAML IDP redirect URLs.

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
      <td>Stormpath [Application](application) to build SAML IDP URLs for.</td>
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
      <td>Name/value pairs to use as query parameters. See the Body section of [SAML Authentication JWT](https://docs.stormpath.com/rest/product-guide/latest/005_auth_n.html#saml-authentication-jwt) for available options.</td>
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
