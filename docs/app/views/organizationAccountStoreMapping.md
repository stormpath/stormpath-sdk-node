## Organization Account Store Mapping

"Account Store" is a generic term for either a [Directory](directory),
[Group](group), or [Organization](organization).  All of these types are
considered "account stores" because they contain, or store, Accounts.  An
"Organization Account Store Mapping", then, represents an Account Store that is
mapped (*assigned*) to an Organization.

In Stormpath, you control who may login to an Organization by associating (*or
mapping*) one or more account stores to an Organization.  All of the Accounts
across all of an organization's assigned account stores form the organization's
effective *user base*: accounts which can log into the Organization.  If no
account stores are assigned to an Organization, no accounts will be able to
log into the Organization.

If an Organization is mapped to an Organization, then all of the account
stores that are mapped to the Organization will also be able to log in
to the Organization.

**Since**: 0.12.0

---


<a name="getOrganization"></a>
### <span class="member">method</span> getOrganization(*[options,]* callback)

Retrieves the associated Organization and provides it to the specified callback.


#### Usage

```javascript
organizationAccountStoreMapping.getOrganization(function(err, organization) {
  console.log(organization);
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
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is an [Organization](organization) instance.</td>
    </tr>
  </tbody>
</table>


#### Returns

If the request fails, the callback's first parameter (`err`) will report the
failure.  If the request succeeds, the instance of  [Organization](organization)
will be provided to the callback as the callback's second parameter.


---


<a name="getAccountStore"></a>
### <span class="member">method</span> getAccountStore(*[options,]* callback)

Retrieves the associated Account Store (*Group or Directory*) and provides it
to the specified callback.


#### Usage

```javascript
orgqnizationAccountStoreMapping.getAccountStore(function(err, accountStore) {
  console.log(accountStore);
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
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is an [Directory](directory) or [Group](group) instance.</td>
    </tr>
  </tbody>
</table>


#### Returns

If the request fails, the callback's first parameter (`err`) will report the
failure.  If the request succeeds, the instance of [Directory](directory) or
[Group](group) will be provided to the callback as the callback's second
parameter.

---
