## Tenant

Stormpath is a multi-tenant software service. When you [sign up for Stormpath](https://api.stormpath.com/register), a private data ‘space’ is created for you. This space is represented as a `Tenant` resource.

It might help to think of a `Tenant` as a Stormpath customer. As a Stormpath Tenant (customer), you own your Tenant resource and everything in it – [Applications](application), [Directories](directory), [Accounts](account), [Groups](group), and so on.

In the Stormpath SDK specifically, your `Tenant` resource can be thought of as your global starting point. You can access everything in your tenant space by accessing your tenant instance first and then interacting with its other linked resources (applications collection, directories collection, etc).

**Since**: 0.1

---

<a name="createApplication"></a>
### <span class="member">method</span> createApplication(application, *[options,]* callback)

Creates a new [Application](application) within the tenant.

#### Usage

Create a new Application with its own private Directory so you can start adding user accounts right away:

```javascript
var app = {name: 'My Awesome App', description: 'Srsly. Awesome.'};

tenant.createApplication(app, {createDirectory:true}, function(err, createdApplication) {
    console.log(createdApplication);
});
```
Create a new Application without any mapped user account stores.  You are responsible for adding account stores later if you want to be able to create new user accounts via the application directly.  Notice there is no _options_ param:

```javascript
var app = {name: 'My Awesome App', description: 'Srsly. Awesome.'};

tenant.createApplication(app, function(err, createdApplication) {
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
      <td>`application`</td>
      <td>`object`</td>
      <td>required</td>
      <td>The application's name/value fields.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as <a href="http://docs.stormpath.com/rest/product-guide/#create-an-application-aka-register-an-application-with-stormpath">query parameters</a>.</td>
    </tr>
    <tr>
      <td>`callback`</td>
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

Creates a new [Directory](directory) within the tenant.

#### Usage

```javascript
var app = {name: 'Employees Directory', description: 'Only Employee accounts in here please.'};

tenant.createApplication(app, function(err, createdApplication) {
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
      <td>`directory`</td>
      <td>`object`</td>
      <td>required</td>
      <td>The directory's name/value fields.</td>
    </tr>
    <tr>
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, to [expand](http://docs.stormpath.com/rest/product-guide/#link-expansion) any of the returned directory's linked resources.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an `Error` object.  The 2nd parameter is the newly created [Directory](directory) resource returned from the server.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the created `Directory` returned from the server will be provided to the `callback` as the callback's second parameter.

---

<a name="getApplications"></a>
### <span class="member">method</span> getApplications(*[options,]* callback)

Retrieves a [collection](collectionResource) of tenant [Application](application)s and provides the collection to the specified `callback`.

If no options are specified, all of the tenant's applications are retrieved.  If options (query parameters) are specified for a search, only those applications matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the tenant's applications:

```javascript
tenant.getApplications(function(err, applications) {
  applications.each(function(err, app, offset) {
    console.log('Offset ' + offset + ', application: ' + app);
  });
});
```
As you can see, the [collection](collectionResource) provided to the `callback` has an [each function](collectionResource#each) that accepts another callback.  The collection will iterate over all of the applications in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the application in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all applications, and only want specific ones, you can search for them by specifying the _options_ argument with [application search](http://docs.stormpath.com/rest/product-guide/#tenant-applications-search) query parameters:

```javascript
tenant.getApplications({name: '*Awesome*'}, function(err, applications) {
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

<a name="getCustomData"></a>
### <span class="member">method</span> getCustomData(*[options,]* callback)

Retrieves the [CustomData](customData) resource of the `Tenant` and provides
it to the specified `callback`.


#### Usage

```javascript
tenant.getCustomData(function(err, customData) {
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

<a name="getDirectories"></a>
### <span class="member">method</span> getDirectories(*[options,]* callback)

Retrieves a [collection](collectionResource) of [tenant [Directories](directory) and provides the collection to the specified `callback`.

If no options are specified, all of the tenant's directories are retrieved.  If options (query parameters) are specified for a search, only those directories matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the tenant's directories:

```javascript
tenant.getDirectories(function(err, directories) {
  directories.each(function(err, dir, offset) {
    console.log('Offset ' + offset + ', dir: ' + dir);
  });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an [each function](collectionResource#each) that accepts another callback.  The collection will iterate over all of the directories in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the directory in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all directories, and only want specific ones, you can search for them by specifying the _options_ argument with [directory search](http://docs.stormpath.com/rest/product-guide/#tenant-directories-search) query parameters:

```javascript
tenant.getDirectories({name: '*foo*'}, function(err, directories) {
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
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is a [collection](collectionResource) containing zero or more [Directory](directory) resources.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved collection of `Directory` resources will be provided to the `callback` as the callback's second parameter.

---

<a name="verifyAccountEmail"></a>
### <span class="member">method</span> verifyAccountEmail(token, callback)

Verifies an account-specific email verification token, obtaining the verified [Account](account) and providing it to the specified `callback`.

#### Usage

Obtain the email verification token from a request and specify that as the `token` argument.  This value is usually obtained as an `sptoken` query parameter value for a request sent to your web application.  For example, `https://www.yourapplication.com/verifyEmail?sptoken=SoMeRaNDomVaLUe`:

```javascript

var token = request.query.sptoken;

tenant.verifyAccountEmail(token, function(err, verifiedAccount) {
  console.log(verifiedAccount);
});
```

See the Stormpath Product Guide's section on [account email verification](http://docs.stormpath.com/rest/product-guide/#account-verify-email) for more information.

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
      <td>`token`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The account email verification, usually obtained as an `sptoken` query parameter value for a request sent to your web application.  For example, `https://www.yourapplication.com/verifyEmail?sptoken=SoMeRaNDomVaLUe`.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the validated [Account](account).</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the retrieved validated [Account](account) will be provided to the `callback` as the callback's second parameter.