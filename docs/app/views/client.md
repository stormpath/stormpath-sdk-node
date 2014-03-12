## Client

A `Client` instance is your starting point for all interactions with the Stormpath REST API - once you have a `Client` instance, you can do everything else.

You can create (and customize) the Stormpath client in a number of ways, but at a bare minimum you need to specify your [Stormpath API Key](http://docs.stormpath.com/rest/quickstart/#get-an-api-ke):

You can do this easily in one of two ways:

* Reference your downloaded `apiKey.properties` file (presumably in `$HOME/.stormpath/apiKey.properties`):

    ```javascript
    var stormpath = require('stormpath');

    //Reference apiKey.properties in the process user's home dir.  Works on both Windows and *nix systems:
    var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
    var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

    var client = null; //available after the ApiKey file is asynchronously loaded from disk

    stormpath.loadApiKey(apiKeyFilePath, function apiKeyFileLoaded(err, apiKey) {
      if (err) throw err;
      client = new stormpath.Client({apiKey: apiKey});
    });
    ```

* Create an ApiKey object manually

    ```javascript
    var stormpath = require('stormpath');

    //In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
    var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

    var client = new stormpath.Client({apiKey: apiKey});
    ```

**Since**: 0.1

---

<a name="ctor"></a>
### <span class="member">constructor</span> Client(options)

The `Client` constructor function creates a new `Client` instance according to the specified `options` argument.

`options` is an Object that contains at least an `apiKey` field with an [ApiKey](apiKey) object.  An `ApiKey` is required for all Client communication to the Stormpath API servers.

#### Usage

You must `require('stormpath')` to access the constructor function:

```javascript
var stormpath = require('stormpath');

var options = {...};

var client = new stormpath.Client(options);
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
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>required</td>
      <td>Options object that must have at least an <code>apiKey</code> field.</td>
    </tr>
  </tbody>
</table>

#### Returns

a new `Client` instance.

---

<a name="createApplication"></a>
### <span class="member">method</span> createApplication(application, *[options,]* callback)

Creates a new [Application](application) instance in the Client's [Tenant](tenant).

#### Usage

Create a new Application with its own private Directory so you can start adding user accounts right away:

```javascript
var app = {name: 'My Awesome App', description: 'Srsly. Awesome.'};

client.createApplication(app, {createDirectory:true}, function(err, createdApplication) {
    if (err) throw err;
    console.log(createdApplication);
});
```
Create a new Application without any mapped user account stores.  You are responsible for adding account stores later if you want to be able to create new user accounts via the application directly.  Notice there is no _options_ param:

```javascript
var app = {name: 'My Awesome App', description: 'Srsly. Awesome.'};

client.createApplication(app, function(err, createdApplication) {
    if (err) throw err;
    console.log(createdApplication);
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
      <td><code>application</code></td>
      <td><code>object</code></td>
      <td>required</td>
      <td>The application's name/value fields.</td>
    </tr>
    <tr>
      <td><em><code>options</code></em></td>
      <td><code>object</code></td>
      <td><em>optional</em></td>
      <td>An object literal of name/value pairs to use as <a href="http://docs.stormpath.com/rest/product-guide/#create-an-application-aka-register-an-application-with-stormpath">query parameters</a>.</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon server response. The 1st parameter is an `Error` object.  The 2nd parameter is the newly created [Application](application) resource returned from the server.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the created `Application` returned from the server will be provided to the `callback` as the callback's second parameter.

---

<a name="createDirectory"></a>
### <span class="member">method</span> createDirectory(directory, *[options,]* callback)

Creates a new [Directory](directory) instance in the Client's [Tenant](tenant).

#### Usage

```javascript
var app = {name: 'Employees Directory', description: 'Only Employee accounts in here please.'};

client.createApplication(app, function(err, createdApplication) {
    if (err) throw err;
    console.log(createdApplication);
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
      <tr>
            <td><code>directory</code></td>
            <td><code>object</code></td>
            <td>required</td>
            <td>The directory's name/value fields.</td>
          </tr>
    </tr>
    <tr>
      <td><em><code>options</code></em></td>
      <td><code>object</code></td>
      <td><em>optional</em></td>
      <td>An object literal of name/value pairs to use as query parameters, for example, to [expand](http://docs.stormpath.com/rest/product-guide/#link-expansion) any of the returned directory's linked resources.</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon server response. The 1st parameter is an `Error` object.  The 2nd parameter is the newly created [Directory](directory) resource returned from the server.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the created `Directory` returned from the server will be provided to the `callback` as the callback's second parameter.

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(accountHref, *[options,]* callback)

Retrieves the [Account](account) resource at `accountHref` and provides it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is an `Account`: it is assumed that the caller knows the `href` represents an account location.

#### Usage

For an `href` that you know represents an account:

```javascript
client.getAccount(accountHref, function(err, account) {
    if (err) throw err;
    console.log(account);
});
```
You can specify query parameters as the __options__ argument, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#account-retrieve):
```javascript
client.getAccount(accountHref, {expand:'customData'}, function(err, account) {
    if (err) throw err;
    console.log(account);
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
      <td><code>accountHref</code></td>
      <td><code>string</code></td>
      <td>required</td>
      <td>The href <em>known</em> to point to an existing Account resource.</td>
    </tr>
    <tr>
      <td><em><code>options</code></em></td>
      <td><code>object></code></td>
      <td><em>optional</em></td>
      <td>An object literal of name/value pairs to use as query parameters, for example, [resource expansion](http://docs.stormpath.com/rest/product-guide/#account-retrieve).</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Account](account) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `Account` resource will be provided to the `callback` as the callback's second parameter.

---

<a name="getApplication"></a>
### <span class="member">method</span> getApplication(applicationHref, *[options,]* callback)

Retrieves the [Application](application) resource at `applicationHref` and provides it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is an `Application`: it is assumed that the caller knows the `applicationHref` represents an application location.

#### Usage

For an `applicationHref` that you know represents an application:

```javascript
client.getApplication(appHref, function(err, app) {
    if (err) throw err;
    console.log(app);
});
```
You can specify query parameters as the __options__ argument, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#retrieve-an-application):
```javascript
client.getApplication(appHref, {expand:'accounts'}, function(err, app) {
    if (err) throw err;
    console.log(app);
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
      <td><code>applicationHref</code></td>
      <td><code>string</code></td>
      <td>required</td>
      <td>The href <em>known</em> to point to an existing Application resource.</td>
    </tr>
    <tr>
      <td><em><code>options</code></em></td>
      <td><code>object></code></td>
      <td><em>optional</em></td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#application-retrieve).</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Application](application) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `Application` resource will be provided to the `callback` as the callback's second parameter.

---

<a name="getApplications"></a>
### <span class="member">method</span> getApplications(*[options,]* callback)

Retrieves a [collection](collectionResource) of [Tenant](tenant) [Application](application)s and provides the collection to the specified `callback`.

If no options are specified, all of the client tenant's applications are retrieved.  If options (query parameters) are specified for a search, only those applications matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of your tenant's applications:

```javascript
client.getApplications(function(err, applications) {
    if (err) throw err;

    applications.each(function(err, app, offset) {
      console.log('Offset ' + offset + ', application: ' + app);
    });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the applications in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the application in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all applications, and only want specific ones, you can search for them by specifying the _options_ argument with [application search](http://docs.stormpath.com/rest/product-guide/#tenant-applications-search) query parameters:

```javascript
client.getApplications({name: '*Awesome*'}, function(err, applications) {
    if (err) throw err;

    applications.each(function(err, app) {
      console.log(app);
    });
});
```
The above code example would only print out applications with the text fragment `Awesome` in their name.  See the Stormpath REST API Guide's [application search documentation](http://docs.stormpath.com/rest/product-guide/#tenant-applications-search) for other supported query parameters, such as reference expansion.

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
      <td>Name/value pairs to use as query parameters, for example, for <a href="http://docs.stormpath.com/rest/product-guide/#application-retrieve">resource expansion</a> or for [searching for applications](http://docs.stormpath.com/rest/product-guide/#tenant-applications-search).</td>
    </tr>
    <tr>
          <td>`callback`</td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is a [CollectionResource](collectionResource) containing zero or more [Application](application) resource instances.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved collection of `Application`s will be provided to the `callback` as the callback's second parameter.

---

<a name="getCurrentTenant"></a>
### <span class="member">method</span> getCurrentTenant(*[options,]* callback)

Retrieves the client's [Tenant](tenant) and provides it to the specified `callback`.

#### Usage

```javascript
client.getCurrentTenant(function(err, tenant) {
    if (err) throw err;
    console.log(tenant);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
client.getCurrentTenant({expand:'applications'}, function(err, tenant) {
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

<a name="getDirectories"></a>
### <span class="member">method</span> getDirectories(*[options,]* callback)

Retrieves a [collection](collectionResource) of [Tenant](tenant) [Directories](directory) and provides the collection to the specified `callback`.

If no options are specified, all of the client tenant's directories are retrieved.  If options (query parameters) are specified for a search, only those directories matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of your tenant's directories:

```javascript
client.getDirectories(function(err, directories) {
    if (err) throw err;

    directories.each(function(err, dir, offset) {
      console.log('Offset ' + offset + ', dir: ' + dir);
    });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the directories in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the directory in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all direcotries, and only want specific ones, you can search for them by specifying the _options_ argument with [directory search](http://docs.stormpath.com/rest/product-guide/#tenant-directories-search) query parameters:

```javascript
client.getDirectories({name: '*foo*'}, function(err, directories) {
    if (err) throw err;

    directories.each(function(err, dir) {
      console.log(dir);
    });
});
```
The above code example would only print out directories with the text fragment `foo` in their name.  See the Stormpath REST API Guide's [directory search documentation](http://docs.stormpath.com/rest/product-guide/#tenant-directories-search) for other supported query parameters, such as reference expansion.

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
      <td>Name/value pairs to use as query parameters, for example, for <a href="http://docs.stormpath.com/rest/product-guide/#retrieve-a-directory">resource expansion</a> or for [searching for directories](http://docs.stormpath.com/rest/product-guide/#tenant-directories-search).</td>
    </tr>
    <tr>
          <td>`callback`</td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is a [CollectionResource](collectionResource) containing zero or more [Directory](directory) resource instances.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved collection of `Directory` resources will be provided to the `callback` as the callback's second parameter.

---

<a name="getDirectory"></a>
### <span class="member">method</span> getDirectory(directoryHref, *[options,]* callback)

Retrieves the [Directory](directory) resource at `directoryHref` and provides it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is a `Directory`: it is assumed that the caller knows the `directoryHref` represents a directory location.

#### Usage

For a `directoryHref` that you know represents a directory:

```javascript
client.getDirectory(directoryHref, function(err, dir) {
    if (err) throw err;
    console.log(dir);
});
```
You can specify query parameters as the __options__ argument, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#retrieve-a-directory):
```javascript
client.getDirectory(directoryHref, {expand:'accounts'}, function(err, dir) {
    if (err) throw err;
    console.log(dir);
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
      <td>`directoryHref`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The href <em>known</em> to point to an existing Directory resource.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#retrieve-a-directory).</td>
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

void; the retrieved `Directory` resource will be provided to the `callback` as the callback's second parameter.

---

<a name="getGroup"></a>
### <span class="member">method</span> getGroup(groupHref, *[options,]* callback)

Retrieves the [Group](group) resource at `groupHref` and provides it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is a `Group`: it is assumed that the caller knows the `groupHref` represents a group location.

#### Usage

For a `groupHref` that you know represents a group:

```javascript
client.getGroup(groupHref, function(err, group) {
    if (err) throw err;
    console.log(group);
});
```
You can specify query parameters as the __options__ argument, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#retrieve-a-group):
```javascript
client.group(groupHref, {expand:'accounts'}, function(err, group) {
    if (err) throw err;
    console.log(group);
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
      <td>`groupHref`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The href <em>known</em> to point to an existing Group resource.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#retrieve-a-group).</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Group](group) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `Group` resource will be provided to the `callback` as the callback's second parameter.

---

<a name="getGroupMembership"></a>
### <span class="member">method</span> getGroupMembership(href, *[options,]* callback)

Retrieves the [GroupMembership](groupMembership) resource at `href` and provides it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is a `GroupMembership`: it is assumed that the caller knows the `href` represents a group location.

#### Usage

For an `href` that you know represents a GroupMembership:

```javascript
client.getGroupMembership(href, function(err, membership) {
    if (err) throw err;
    console.log(membership);
});
```
You can specify query parameters as the __options__ argument, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#retrieve-a-group-membership):
```javascript
client.getGroupMembership(href, {expand:'account,group'}, function(err, membership) {
    if (err) throw err;
    console.log(membership);
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
      <td>`href`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The href <em>known</em> to point to an existing GroupMembership resource.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#retrieve-a-group-membership).</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [GroupMembership](groupMembership) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved `GroupMembership` resource will be provided to the `callback` as the callback's second parameter.
