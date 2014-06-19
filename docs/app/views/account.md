## Account

An `Account` is a unique identity within a [Directory](directory), with a unique username and/or email address. An Account can log in to an [Application](application) using either the email address or username associated with it. Accounts can represent your end users (people), but they can also be used to represent services, daemons, processes, or any “entity” that needs to login to a Stormpath-enabled application.

Additionally, an account may only exist in a single directory and may be in multiple groups owned by that directory. Accounts may not be assigned to groups within other directories.

It should be noted that the words ‘User’ and ‘Account’ usually mean the same thing, but there is a subtle difference that can be important at times:

* An Account is a unique identity within a Directory. An account can exist in only a single directory but can be a part of multiple groups owned by that directory.
* When an account is granted access to an application (by [mapping a Directory or Group](http://docs.stormpath.com/rest/product-guide/#account-store-mappings) that contains the account to the application), it becomes a ‘User’ of that application.

Therefore an Account can be called a ‘User’ of an application if/when it can login to the application.

An `Account` resource have predefined fields that are useful to many `Applications`,
 but you are likely to have your own custom data that you need to associate
 with an `account` as well.  You can create your own custom data fields when
 creating `account` with [application.createAccount](application#createAccount)
 or [directory.createAccount](directory#createAccount). A `customData` can be
 updated as part of `account` resource or as a separate resource via `getCustomData` method.

**Since**: 0.1

---

<a name="addToGroup"></a>
### <span class="member">method</span> addToGroup(groupOrGroupHref, *[options,]* callback)

Adds the account to the specified [Group](group).  The group must have already been persisted - new groups cannot be created via this method.

#### Usage

You may specify an account directly:

```javascript
account.addToGroup(group, function onMembershipCreated(err, membership) {
  if (err) throw err;
  console.log(membership);
};
```
Or just an group's `href`:

```javascript
account.addToGroup(groupHref, function onMembershipCreated(err, membership) {
  if (err) throw err;
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
      <td>`groupOrGroupHref`</td>
      <td>`object` or `string`</td>
      <td>required</td>
      <td>Either a previously-persisted [Group](group) resource or the `href` string of a previously-persisted group.</td>
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

<a name="createApiKey"></a>
### <span class="member">method</span> createApiKey(callback)

Creates an [Api Key](apiKey) for this account, which can be used to authenticate a request to your service. For more information please read [Using Stormpath to Secure and Manage API Services](http://docs.stormpath.com/guides/securing-your-api/)

#### Usage

````javascript
account.createApiKey(function(err,apiKey){
  console.log(apiKey);
})
````

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
    <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>
        The function to call when the Api Key has been created,
        will be called with an error or instance of `ApiKey`.
      </td>
    </tr>
  </tbody>
</table>

---

<a name="getApiKeys"></a>
### <span class="member">method</span> getApiKeys(*[options,]* callback)

Retrieves a [collection](collectionResource) of the account's [Api Keys](apiKey) and provides the collection to the specified `callback`.

You can pass an `id` property on the `options` object to search for an Api Key by it's id.

#### Usage

````javascript
account.getApiKeys(function(err,collectionResult){
  collectionResult.each(function(apiKey){
    console.log(apiKey);
  })
})
````

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
      <td>Name/value pairs to use as query parameters, only supports `id`.</td>
    </tr>
    <tr>
    <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>
        The function to call when the request is complete,
        it will be called with an error or a [collection](collectionResource) that contains
        `ApiKey` instances.
      </td>
    </tr>
  </tbody>
</table>


---

<a name="getGroups"></a>
### <span class="member">method</span> getGroups(*[options,]* callback)

Retrieves a [collection](collectionResource) of the account's assigned [Group](group)s and provides the collection to the specified `callback`.

If no options are specified, all of the account's groups are retrieved.  If options (query parameters) are specified for a search, only those groups matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the account's groups:

```javascript
account.getGroups(function(err, groups) {
    if (err) throw err;

    groups.each(function(err, group, offset) {
      console.log('Offset ' + offset + ', group: ' + group);
    });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the groups in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the group in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all groups, and only want specific ones, you can search for them by specifying the _options_ argument with [account group](http://docs.stormpath.com/rest/product-guide/#account-groups) search query parameters:

```javascript
account.getGroups({name: '*bar*'}, function(err, accounts) {
    if (err) throw err;

    accounts.each(function(err, account) {
      console.log(account);
    });
});
```
The above code example would only print out the account's groups with the text fragment `bar` in their name.  See the Stormpath REST API Guide's [account group documentation](http://docs.stormpath.com/rest/product-guide/#account-groups) for other supported query parameters, such as reference expansion.

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
      <td>Name/value pairs to use as query parameters, for example, for [account group](http://docs.stormpath.com/rest/product-guide/#account-groups) search or reference expansion.</td>
    </tr>
    <tr>
    <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is a [collection](collectionResource) containing zero or more [Group](group) resources.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved collection of [Group](group)s will be provided to the `callback` as the callback's second parameter.

---

<a name="getGroupMemberships"></a>
### <span class="member">method</span> getGroupMemberships(*[options,]* callback)

Retrieves a [collection](collectionResource) of the account's [GroupMembership](groupMembership)s and provides the collection to the specified `callback`.

If no options are specified, all of the account's groupMemberships are retrieved.  If options (query parameters) are specified for expansion, the returned memberships will have references expanded as necessary.

#### Usage

If you want to retrieve all of the group's memberships/associations:

```javascript
account.getGroupMemberships(function(err, memberships) {
    if (err) throw err;

    memberships.each(function(err, membership, offset) {
      console.log('Offset ' + offset + ', membership: ' + membership);
    });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the memberships in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the membership in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you want the returned memberships to have their groups expanded (so you can access the membership and its associated group), you can specify an `expand` query parameter:

```javascript
account.getGroupMemberships({expand: 'group'}, function(err, memberships) {
    if (err) throw err;

    memberships.each(function(err, membership) {
      console.log(membership);

      //the membership's 'group' property will be available immediately:
      console.log(membership.group);
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
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is a [collection](collectionResource) containing zero or more [GroupMembership](groupMembership) resources.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved [collection](collectionResource) of the account's [GroupMembership](groupMembership)s will be provided to the `callback` as the callback's second parameter.

---

<a name="getDirectory"></a>
### <span class="member">method</span> getDirectory(*[options,]* callback)

Retrieves the account's parent [Directory](directory) and provides it to the specified `callback`.

#### Usage

```javascript
account.getDirectory(function(err, directory) {
    if (err) throw err;
    console.log(directory);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
account.getDirectory({expand:'groups'}, function(err, directory) {
    if (err) throw err;
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

Retrieves the account's owning [Tenant](tenant) and provides it to the specified `callback`.

#### Usage

```javascript
account.getTenant(function(err, tenant) {
    if (err) throw err;
    console.log(tenant);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
account.getTenant({expand:'applications'}, function(err, tenant) {
    if (err) throw err;
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

Retrieves the [CustomData](customData) resource of the `Account`'s assigned
 `CustomData` and provides it to the specified `callback`.

#### Usage

For an `href` that you know represents an account:

```javascript
account.getCustomData(function(err, customData) {
    if (err) throw err;
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

<a name="getProviderData"></a>
### <span class="member">method</span> getProviderData(*[options,]* callback)

Retrieves the account's `ProviderData` information  and provides it to the specified `callback`.
If `providerData` not set, `callback` will be called without parameters

#### Usage

```javascript
account.getProviderData(function(err, providerData) {
    if (err) throw err;
    console.log(providerData);
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
      <td>The callback to execute upon resource retrieval.
        The 1st parameter is an `Error` object.
        The 2nd parameter is the retrieved `ProviderData` resource.
      </td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `ProviderData` resource will be provided to the `callback` as the callback's second parameter.

---