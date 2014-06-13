## Group

A `Group` is a collection of [Account](account)s within a [Directory](directory)
 that are often used for authorization and access control in an
 [Application](application). In Stormpath, the term Group is synonymous with 'Role'.

For example, an application will often check which groups are assigned
 to an account, and perform access control decisions based on which groups
 the account has or not.

An `Group` resource have predefined fields that are useful to many `Applications`,
 but you are likely to have your own custom data that you need to associate
 with a `group` as well. You can create your own custom data fields when
 creating `group` with [application.createGroup](application#createGroup)
 or [directory.createGroup](directory#createGroup).
 A `customData` can be updated as part of `group` resource or as a separate resource
 via `getCustomData` method.

**Since**: 0.1

---

<a name="addAccount"></a>
### <span class="member">method</span> addAccount(accountOrAccountHref, *[options,]* callback)

Adds the specified [Account](account) to the group.  The account must have already been persisted - new accounts cannot be created via this method.

#### Usage

You may specify an account directly:

```javascript
group.addAccount(account, function onMembershipCreated(err, membership) {
  console.log(membership);
};
```
Or just an account's `href`:

```javascript
group.addAccount(accountHref, function onMembershipCreated(err, membership) {
  console.log(membership);
};
```

In both cases, the [GroupMembership](groupMembership) representing the group-to-account association will be provided to the callback as the callback's second parameter.  You can obtain either the group or the account via `membership.group` or 'membership.account`, respectively.

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
      <td>`accountOrAccountHref`</td>
      <td>`object` or `string`</td>
      <td>required</td>
      <td>Either a previously-persisted [Account](account) resource or the `href` string of a previously-persisted account.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, for returned resource reference expansion.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is the [GroupMembership](groupMembership) that reflects the group-to-account association. You can obtain either the group or the account via `membership.group` or 'membership.account`, respectively.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; If the association fails, the callback's first parameter (`err`) will report the failure.  If the association succeeds, the [GroupMembership](groupMembership) will be provided to the `callback` as the callback's second parameter.  You can obtain either the group or the account via `membership.group` or 'membership.account`, respectively.

---

<a name="getAccounts"></a>
### <span class="member">method</span> getAccounts(*[options,]* callback)

Retrieves a [collection](collectionResource) of the groups's assigned [Account](account)s and provides the collection to the specified `callback`.

If no options are specified, all of the groups's accounts are retrieved.  If options (query parameters) are specified for a search, only those accounts matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the group's accounts:

```javascript
group.getAccounts(function(err, accounts) {
  accounts.each(function(err, account, offset) {
    console.log('Offset ' + offset + ', account: ' + account);
  });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the accounts in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the account in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all accounts, and only want specific ones, you can search for them by specifying the _options_ argument with [group account](http://docs.stormpath.com/rest/product-guide/#group-accounts) search query parameters:

```javascript
group.getAccounts({username: '*foo*'}, function(err, accounts) {
  accounts.each(function(err, account) {
    console.log(account);
  });
});
```
The above code example would only print out group accounts with the text fragment `foo` in the username.  See the Stormpath REST API Guide's [group account documentation](http://docs.stormpath.com/rest/product-guide/#group-accounts) for other supported query parameters, such as reference expansion.

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
      <td>*`options`*</td>
      <td>`object`</td>
      <td>*optional*</td>
      <td>Name/value pairs to use as query parameters, for example, for [group account](http://docs.stormpath.com/rest/product-guide/#group-accounts) search or reference expansion.</td>
    </tr>
    <tr>
    <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is a [collection](collectionResource) containing zero or more [Account](account) resources.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved collection of `Account`s will be provided to the `callback` as the callback's second parameter.

---

<a name="getAccountMemberships"></a>
### <span class="member">method</span> getAccountMemberships(*[options,]* callback)

Retrieves a [collection](collectionResource) of the groups's [membership](groupMembership)s and provides the collection to the specified `callback`.

If no options are specified, all of the groups's membership entities are retrieved.  If options (query parameters) are specified for expansion, the returned memberships will have references expanded as necessary.

#### Usage

If you want to retrieve all of the group's memberships/associations:

```javascript
group.getAccountMemberships(function(err, memberships) {
  memberships.each(function(err, membership, offset) {
    console.log('Offset ' + offset + ', membership: ' + membership);
  });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the memberships in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the membership in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you want the returned memberships to have their accounts expanded (so you can access the membership and its associated account), you can specify an `expand` query parameter:

```javascript
group.getAccountMemberships({expand: 'account'}, function(err, memberships) {
  memberships.each(function(err, membership) {
    console.log(membership);

    //the membership's 'account' property will be available immediately:
    console.log(membership.account);
  });
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
      <td>*`options`*</td>
      <td>`object`</td>
      <td>*optional*</td>
      <td>Name/value pairs to use as query parameters, for example, for reference expansion.</td>
    </tr>
    <tr>
    <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is a [collection](collectionResource) containing zero or more [membership](groupMembership) resources.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved [collection](collectionResource) of the group's memberships will be provided to the `callback` as the callback's second parameter.

---

<a name="getDirectory"></a>
### <span class="member">method</span> getDirectory(*[options,]* callback)

Retrieves the group's parent [Directory](directory) and provides it to the specified `callback`.

#### Usage

```javascript
group.getDirectory(function(err, directory) {
  console.log(directory);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
group.getDirectory({expand:'accounts'}, function(err, directory) {
  console.log(directory);
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
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Directory](directory) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved [Directory](directory) resource will be provided to the `callback` as the callback's second parameter.

---

<a name="getTenant"></a>
### <span class="member">method</span> getTenant(*[options,]* callback)

Retrieves the group's owning [Tenant](tenant) and provides it to the specified `callback`.

#### Usage

```javascript
group.getTenant(function(err, tenant) {
  console.log(tenant);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
group.getTenant({expand:'applications'}, function(err, tenant) {
  console.log(tenant);
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
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Tenant](tenant) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `Tenant` resource will be provided to the `callback` as the callback's second parameter.

---

<a name="getCustomData"></a>
### <span class="member">method</span> getCustomData(*[options,]* callback)

Retrieves the [CustomData](customData) resource of the `Group`'s assigned
 `CustomData` and provides it to the specified `callback`.

#### Usage

For an `href` that you know represents an account:

```javascript
group.getCustomData(function(err, customData) {
  console.log(customData);
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
      <td><em><code>options</code></em></td>
      <td><code>object</code></td>
      <td><em>optional</em></td>
      <td>An object literal of name/value pairs to use as query parameters, for example, [resource expansion](http://docs.stormpath.com/rest/product-guide/#account-retrieve).</td>
    </tr>
    <tr>
      <td><code>callback</code></td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval.
       The 1st parameter is an `Error` object.
       The 2nd parameter is the retrieved [CustomData](customData) resource.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `CustomData` resource will be provided to the `callback`
 as the callback's second parameter.

---