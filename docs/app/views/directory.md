## Directory

A `Directory` is a top-level storage containers of [Account](account)s and [Group](group)s. A Directory also manages security policies (like password strength) for the Accounts it contains.

Additionally:

* All `Account`s within a directory have a unique username and email address.
* All `Group`s within a directory have a unique name.

**Since**: 0.1

---

<a name="createAccount"></a>
### <span class="member">method</span> createAccount(account, *[options,]* callback)

Creates a new [Account](account) in the directory.  Every account in the directory must have a unique `username` and a unique `email` address.

#### Usage

Example:

```javascript
var account = {
  givenName: 'Jean-Luc',
  surname: 'Picard',
  username: 'jlpicard',
  email: 'jlpicard@starfleet.com',
  password: 'Changeme1!'
};

directory.createAccount(account, function onAccountCreated(err, createdAccount) {
  console.log(createdAccount);
});
```

Whenever you create an `account`, an empty `customData` resource is created
 for that `account` automatically, but when you need to populate custom data on
 `account` creation you can embed `customData` directly in `account` resource.

 ```javascript
 var account = {
  givenName: 'Jean-Luc',
  surname: 'Picard',
  username: 'jlpicard',
  email: 'jlpicard@starfleet.com',
  password: 'Changeme1!',
  customData: {
    rank: 'Captain',
    birthDate: '2305-07-13',
    birthPlace: 'La Barre, France',
    favoriteDrink: 'Earl Grey tea'
  }
};

directory.createAccount(account, function onAccountCreated(err, createdAccount) {
  console.log(createdAccount);
});
```

You can also specify options to control creation behavior and things like reference expansion:

```javascript
...

var options = {registrationWorkflowEnabled: false};

directory.createAccount(account, options, function onAccountCreated(err, createdAccount) {
  console.log(createdAccount);
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
      <td>`account`</td>
      <td>`object`</td>
      <td>required</td>
      <td>The account's name/value fields.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as <a href="http://docs.stormpath.com/rest/product-guide/#account-create-no-email">query parameters</a>.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an `Error` object.  The 2nd parameter is the newly created [Account](account) resource returned from the server.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the created [Account](account) returned from the server will be provided to the `callback` as the callback's second parameter.

---

<a name="createGroup"></a>
### <span class="member">method</span> createGroup(group, *[options,]* callback)

Creates a new [Group](group) in the directory.  Every group in the directory must have a unique `name`.

#### Usage

Example:

```javascript
var group = {name: 'Administrators'}

directory.createGroup(group, onGroupCreation(err, createdGroup) {
  console.log(createdGroup);
});
```

You can also specify options to control things like reference expansion:

```javascript
directory.createGroup(group, {expand:'directory'}, function onAccountCreated(err, createdGroup) {
  console.log(createdGroup);
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
      <td>`group`</td>
      <td>`object`</td>
      <td>required</td>
      <td>The group's name/value fields.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an `Error` object.  The 2nd parameter is the newly created [Group](group) resource returned from the server.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the created [Group](group) returned from the server will be provided to the `callback` as the callback's second parameter.

---

<a name="getAccounts"></a>
### <span class="member">method</span> getAccounts(*[options,]* callback)

Retrieves a [collection](collectionResource) of the directory's [Account](account)s and provides the collection to the specified `callback`.

If no options are specified, all of the directory's accounts are retrieved.  If options (query parameters) are specified for a search, only those accounts matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the directory's accounts:

```javascript
directory.getAccounts(function(err, accounts) {
  accounts.each(function(err, account, offset) {
    console.log('Offset ' + offset + ', account: ' + account);
  });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the accounts in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the account in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all accounts, and only want specific ones, you can search for them by specifying the _options_ argument with [directory account](http://docs.stormpath.com/rest/product-guide/#directory-accounts) search query parameters:

```javascript
directory.getAccounts({username: '*foo*'}, function(err, accounts) {
  accounts.each(function(err, account) {
    console.log(account);
  });
});
```
The above code example would only print out directory accounts with the text fragment `foo` in the username.  See the Stormpath REST API Guide's [directory account documentation](http://docs.stormpath.com/rest/product-guide/#directory-accounts) for other supported query parameters, such as reference expansion.

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
      <td>Name/value pairs to use as query parameters, for example, for [directory account](http://docs.stormpath.com/rest/product-guide/#directory-accounts) search or reference expansion.</td>
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

<a name="getCustomData"></a>
### <span class="member">method</span> getCustomData(*[options,]* callback)

Retrieves the [CustomData](customData) resource of the `Directory` and provides
it to the specified `callback`.


#### Usage

```javascript
directory.getCustomData(function(err, customData) {
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

<a name="getGroups"></a>
### <span class="member">method</span> getGroups(*[options,]* callback)

Retrieves a [collection](collectionResource) of the directory's [Group](group)s and provides the collection to the specified `callback`.

If no options are specified, all of the directory's groups are retrieved.  If options (query parameters) are specified for a search, only those groups matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the directory's groups:

```javascript
directory.getGroups(function(err, groups) {
  groups.each(function(err, group, offset) {
    console.log('Offset ' + offset + ', group: ' + group);
  });
});
```
As you can see, the [collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the groups in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the group in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all groups, and only want specific ones, you can search for them by specifying the _options_ argument with [directory group](http://docs.stormpath.com/rest/product-guide/#directory-groups) search query parameters:

```javascript
directory.getGroups({name: '*bar*'}, function(err, groups) {
  groups.each(function(err, group) {
    console.log(group);
  });
});
```
The above code example would only print out groups with the text fragment `foo` in their name.  See the Stormpath REST API Guide's [directory group](http://docs.stormpath.com/rest/product-guide/#directory-groups) documentation for other supported query parameters, such as reference expansion.

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
      <td>Name/value pairs to use as query parameters, for example, for [directory group](http://docs.stormpath.com/rest/product-guide/#directory-groups) search or reference expansion.</td>
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

void; the retrieved collection of `Group`s will be provided to the `callback` as the callback's second parameter.

---

<a name="getTenant"></a>
### <span class="member">method</span> getTenant(*[options,]* callback)

Retrieves the directory's owning [Tenant](tenant) and provides it to the specified `callback`.

#### Usage

```javascript
directory.getTenant(function(err, tenant) {
  console.log(tenant);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
directory.getTenant({expand:'applications'}, function(err, tenant) {
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

<a name="getProvider"></a>
### <span class="member">method</span> getProvider(*[options,]* callback)

Retrieves the directory's `Provider` information  and provides it to the specified `callback`.
If `provider` not set, `callback` will be called without parameters.

#### Usage

```javascript
directory.getProvider(function(err, provider) {
  console.log(provider);
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
        The 2nd parameter is the retrieved `Provider` resource.
      </td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `Provider` resource will be provided to the `callback` as the callback's second parameter.

---