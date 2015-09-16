## Organization

An Organization in Stormpath represents a collection of account stores.
An Organization can be mapped to an application.  This hierarchy is designed
for multi-tenant environments, where your customers may need to have
multiple account stores.

---

<a name="createAccountStoreMapping"></a>
### <span class="member">method</span> createAccountStoreMapping(accountStoreMapping, callback)

Creates an instance of [OrganizationAccountStoreMapping](organizationAccountStoreMapping) from the `accountStoreMapping` literal and associates it with current Organization.
Returns a newly created `OrganizationAccountStoreMapping` as a second callback parameter.


#### Usage


```javascript
var mapping = {
  accountStore: {
    href: "https://api.stormpath.com/v1/directories/bckhcGMXQDujIXpExAmPLe"
  },
  isDefaultAccountStore: true,
  isDefaultGroupStore: true
};

organization.createAccountStoreMapping(mapping, function(err, result) {
  var organizationAccountStoreMapping = result;
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
      <td>`accountStoreMapping`</td>
      <td>`object`</td>
      <td>required</td>
      <td> An object literal which contains an `accountStore` property
        that references the account store that you want to add to this
        Organization.  Can be a [Directory](directory) or [Group](group).
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).
      The 2nd parameter is an [OrganizationAccountStoreMapping](organizationAccountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, an instance of  [OrganizationAccountStoreMapping](organizationAccountStoreMapping) will be provided to the `callback` as the callback's second parameter.

---