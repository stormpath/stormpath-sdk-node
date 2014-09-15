## Account

An Account is a unique identity within a [Directory](directory), with a
unique username and/or email address.  An Account can log in to an
[Application](application) using either the email address or username
associated with it.  Accounts can represent your end users (*people*), but
they can also be used to represent services, daemons, processes, or any
"entity" that needs to login to a Stormpath-powered application.

Additionally, an Account may only exist in a single Directory and may be in
multiple Groups owned by that Directory.  Accounts may not be assigned to
groups within other directories.

It should be noted that the words "User" and "Account" usually mean the same
thing, but there is a subtle difference that can be important at times:

* An Account is a unique identity within a Directory.  An Account can exist in
  only a single Directory but can be a part of multiple groups owned by that
  Directory.
* When an Account is granted access to an Application (*by
  [mapping a Directory or Group][] that contains the Account to the
  Application*), it becomes a "User" of that Application.

Therefore an Account can be called a "User" of an Application if/when it can
log into the Application.

An Account resource has predefined fields that are useful to many applications,
but you are likely to have your own custom data that you need to associate with
an Account as well.  You can create your own custom data fields when creating
an Account with [application.createAccount](application#createAccount) or
[directory.createAccount](directory#createAccount).  Custom data can be set
directly on an Account resource or independently.

**Since**: 0.1

---


<a name="addToGroup"></a>
### <span class="member">method</span> addToGroup(groupOrGroupHref, *[options,]* callback)

Adds the Account to the specified [Group](group).  The Group must have already
been persisted - new groups cannot be created via this method.


#### Usage

You may specify a Group directly:

```javascript
account.addToGroup(group, function(err, membership) {
  console.log(membership);
});
```

Or just an group's `href`:

```javascript
account.addToGroup(groupHref, function(err, membership) {
  console.log(membership);
});
```

In both cases, the [GroupMembership](groupMembership) representing the
group-to-account association will be provided to the callback as the callback's
second parameter.  You can obtain either the Group or the Account via
`membership.group` or `membership.account`, respectively.


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
      <td>The callback to execute upon server response.  The 1st parameter is an [error](resourceError).  The 2nd parameter is the [GroupMembership](groupMembership) that reflects the group-to-account association. You can obtain either the group or the account via `membership.group` or 'membership.account`, respectively.</td>
    </tr>
  </tbody>
</table>


#### Returns

If the association fails, the callback's first parameter (`err`) will report
the failure.  If the association succeeds, the
[GroupMembership](groupMembership) will be provided to the `callback` as the
callback's second parameter.  You can obtain either the Group or the Account
via `membership.group` or `membership.account`, respectively.

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

When retrieving the API Key from Stormpath, it is doubly encrypted: in transit over SSL by default, but also the API Key secret is additionally encrypted to ensure that nothing before or after SSL transit may even see the secret.  Additionally, API Key secret values remain encrypted if caching is enabled, so you don’t have to worry if your cache supports encryption.

This all happens by default; there is nothing you need to configure to obtain these benefits.  However, if you would like to customize the secondary encryption options, you may do so:

For those interested, password-based AES 256 encryption is used: the password is the API Key Secret you used to configure the SDK Client.  The PBKDF2 implementation will use 1024 iterations by default to derive the AES 256 key.  At the risk of potentially decreased security, you can use the `options` argument to specify a lower level of encryption key size, like 192 or 128.  You can also request a lower number of key iterations. This can reduce the CPU time required to decrypt the key after transit or when retrieving from cache. It is not recommended to go much lower than 1024 (if at all) in security sensitive environments.


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
      <td><em>`options`</em></td>
      <td>`object`</td>
      <td><em>optional</em></td>
      <td>
        <p>An object which allows you to modify the query parameters for this request, the following properties are valid:</p>
        <ul>
          <li>`id` - search for a specific key by id</li>
          <li>`encryptionKeySize` - Set to `128` or `192` to change the AES key encryption size</li>
          <li>`encryptionKeyIterations` - Defaults to `1024`</li>
        </ul>

      </td>
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

Retrieves a [collection](collectionResource) of the account's assigned
[Group](group)s and provides the collection to the specified `callback`.

If no options are specified, all of the account's groups are retrieved.  If
options (*query parameters*) are specified for a search, only those groups
matching the search will be retrieved.  If the search does not return any
results, the collection will be empty.


#### Usage

If you want to retrieve *all* of the account's groups:

```javascript
account.getGroups(function(err, groups) {
  groups.each(function(group) {
    console.log(group);
  });
});
```

As you can see, the [Collection](collectionResource) provided to the `callback`
has an `each` function that accepts its own callback.  The collection will
iterate over all of the groups in the collection, and invoke the callback for
each one.

If you don't want all groups, and only want specific ones, you can search for
them by specifying the *options* argument with [account group][] search query
parameters:

```javascript
account.getGroups({name: '*bar*'}, function(err, groups) {
  groups.each(function(account) {
    console.log(account);
  });
});
```

The above code example would only print out the account's groups with the text
fragment `bar` in their name.  See the [account group documentation][] for
other supported query parameters, such as reference expansion.


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

The retrieved collection of [Group](group)s will be provided to the `callback`
as the callback's second parameter.

---


<a name="getGroupMemberships"></a>
### <span class="member">method</span> getGroupMemberships(*[options,]* callback)

Retrieves a [collection](collectionResource) of the account's
[GroupMembership](groupMembership)s and provides the collection to the
specified `callback`.

If no options are specified, all of the account's groupMemberships are
retrieved.  If options (*query parameters*) are specified for expansion, the
returned memberships will have references expanded as necessary.


#### Usage

If you want to retrieve all of the group's memberships/associations:

```javascript
account.getGroupMemberships(function(err, memberships) {
  memberships.each(function(membership) {
    console.log(membership);
  });
});
```

As you can see, the [Collection](collectionResource) provided to the `callback`
has an `each` function that accepts its own callback.  The collection will
iterate over all of the memberships in the collection, and invoke the callback
for each one.

If you want the returned memberships to have their groups expanded (*so you can
access the membership and its associated group*), you can specify an `expand`
query parameter:

```javascript
account.getGroupMemberships({expand: 'group'}, function(err, memberships) {
  memberships.each(function(membership) {
    console.log(membership);
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
      <td>The callback to execute upon resource retrieval.  The 1st parameter is an `Error` object.  The 2nd parameter is a [collection](collectionResource) containing zero or more [GroupMembership](groupMembership) resources.</td>
    </tr>
  </tbody>
</table>


#### Returns

The retrieved [collection](collectionResource) of the account's
[GroupMembership](groupMembership)s will be provided to the `callback` as the
callback's second parameter.

---


<a name="getDirectory"></a>
### <span class="member">method</span> getDirectory(*[options,]* callback)

Retrieves the account's parent [Directory](directory) and provides it to the
specified `callback`.


#### Usage

```javascript
account.getDirectory(function(err, directory) {
  console.log(directory);
});
```

You can also use [resource expansion][] options (*query params*) to obtain
linked resources in the same request:

```javascript
account.getDirectory({expand:'groups'}, function(err, directory) {
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

The retrieved [Directory](directory) resource will be provided to the `callback`
as the callback's second parameter.

---


<a name="getTenant"></a>
### <span class="member">method</span> getTenant(*[options,]* callback)

Retrieves the account's owning [Tenant](tenant) and provides it to the
specified `callback`.


#### Usage

```javascript
account.getTenant(function(err, tenant) {
  console.log(tenant);
});
```

You can also use [resource expansion][] options (*query params*) to obtain
linked resources in the same request:

```javascript
account.getTenant({expand:'applications'}, function(err, tenant) {
  console.log(tenant);
  tenant.applications.each(function(application) {
    console.log(application);
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

The retrieved `Tenant` resource will be provided to the `callback` as the
callback's second parameter.

---


<a name="getCustomData"></a>
### <span class="member">method</span> getCustomData(*[options,]* callback)

Retrieves the [CustomData](customData) resource of the `Account` and provides
it to the specified `callback`.


#### Usage

```javascript
account.getCustomData(function(err, customData) {
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

The retrieved `CustomData` resource will be provided to the `callback` as the
callback's second parameter.

---


<a name="getProviderData"></a>
### <span class="member">method</span> getProviderData(*[options,]* callback)

Retrieves the account's `providerData` information and provides it to the
specified `callback`.  If `providerData` not set, `callback` will be called
without parameters


#### Usage

```javascript
account.getProviderData(function(err, providerData) {
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

The retrieved `providerData` resource will be provided to the `callback` as the
callback's second parameter.

---


  [mapping a Directory or Group]: http://docs.stormpath.com/rest/product-guide/#account-store-mappings "Stormpath Account Store Mappings"
  [account group]: http://docs.stormpath.com/rest/product-guide/#account-groups "Stormpath Account Groups"
  [account group documentation]: http://docs.stormpath.com/rest/product-guide/#account-groups "Stormpath Account Group Documentation"
  [resource expansion]: http://docs.stormpath.com/rest/product-guide/#link-expansion "Stormpath Resource Expansion"
