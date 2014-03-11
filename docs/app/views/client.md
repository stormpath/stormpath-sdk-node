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

<a id="ctor"></a>
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

<a id="createApplication"></a>
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
      <td><a href="application">Application</a> or `object` literal.</td>
      <td>required</td>
      <td>The Application to create</code> field.</td>
    </tr>
    <tr>
      <td><em>options</em></td>
      <td><code>object></code></td>
      <td><em>optional</em></td>
      <td>An object literal of name/value pairs to use as <a href="http://docs.stormpath.com/rest/product-guide/#create-an-application-aka-register-an-application-with-stormpath">query parameters</a>.</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon server response. The 1st parameter is an `Error` object.  The 2nd parameter is the newly created `Application` resource returned from the server.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the created `Application` returned from the server will be provided to the `callback` as the callback's second parameter.

---

<a id="createDirectory"></a>
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
      <td><code>directory</code></td>
      <td><a href="directory">Directory</a> or `object` literal.</td>
      <td>required</td>
      <td>The Directory to create</code> field.</td>
    </tr>
    <tr>
      <td><em>options</em></td>
      <td><code>object></code></td>
      <td><em>optional</em></td>
      <td>An object literal of name/value pairs to use as query parameters, for example, to [expand](http://docs.stormpath.com/rest/product-guide/#link-expansion) any of the returned directory's linked resources.</td>
    </tr>
    <tr>
          <td><code>callback</code></td>
          <td>function</td>
          <td>required</td>
          <td>The callback to execute upon server response. The 1st parameter is an `Error` object.  The 2nd parameter is the newly created `Directory` resource returned from the server.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the created `Directory` returned from the server will be provided to the `callback` as the callback's second parameter.




