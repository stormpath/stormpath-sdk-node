## Client

A `Client` instance is your starting point for all interactions with the
Stormpath REST API.  Once you have a `Client` instance, you can do everything
else.

You can create (*and customize*) the Stormpath client in a number of ways, but
at a bare minimum you need to specify your [Stormpath API Key][] information.

You can do this in one of two ways:

* Reference your downloaded `apiKey.properties` file (*presumably
  `~/.stormpath/apiKey.properties`*):

  ```javascript
  var stormpath = require('stormpath');

  // Platform agnostic way of getting the home directory.
  var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
  var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

  // Available after the properties file is asynchronously loaded from disk.
  var client;

  stormpath.loadApiKey(apiKeyFilePath, function(err, apiKey) {

    client = new stormpath.Client({apiKey: apiKey});
  });
  ```

* Create an ApiKey object manually:

  ```javascript
  var stormpath = require('stormpath');

  // In this example, we'll reference the API credentials from environment
  // variables (*NEVER HARDCODE API KEY VALUES IN SOURCE CODE!*).
  var apiKey = new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  );

  var client = new stormpath.Client({apiKey: apiKey});
  ```

**Since**: 0.1

---

<a name="ctor"></a>
### <span class="member">constructor</span> Client(options)

The `Client` constructor function creates a new `Client` instance according to
the specified `options` argument.

`options` is an object that contains at least an `apiKey` field with an
[ApiKey](apiKey) object.  An `ApiKey` is required for all Client communication
to the Stormpath service.


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
    <tr>
      <td><code>options.cacheOptions</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>See "Cache options parameters" below for details.</td>
    </tr>
    <tr>
      <td><code>options.nonceStore</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>See "Custom Nonce Store" below for details.</td>
    </tr>
  </tbody>
</table>

---



### Caching

The caching mechanism enables you to store the state of an already accessed
resource in a cache store.

If you access the resource again and the data inside the cache hasn't yet
expired, you would get the resource directly from the cache store.

By doing so, you can reduce network traffic and still have access to some of
the resources even if there is a connectivity problem with `Stormpath`.

Be aware, however, that when using a persistent cache store like [Redis][],
if the data changes quickly on `Stormpath` and the `TTL` and `TTI` are set to
a large value, you may get resources with attributes that don't reflect the
actual state.

If this edge case won't affect your data consistency, you can use the caching
mechanism by providing an additional parameter when creating the `Client`
instance:

```javascript
var cacheOptions = {
  store: 'redis',
  connection: {
    host: 'localhost',
    port: 6379,
  },
  options: {
    // redis client options (username, password, etc.)
  },
  ttl: 300,
  tti: 300
};

var client = new stormpath.Client({
  apiKey: apiKey,
  cacheOptions: cacheOptions
});
```

### Cache options Parameters

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
      <td><code>store</code></td>
      <td><code>string|function</code></td>
      <td>optional</td>
      <td>The name or function that representing which cache store to use.
        By default `memory` store provider is used.
        Available options: `memory`, `memcached`, `redis`.
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>The store specific connection options, if any.  e.g. `redis` requires a host
        and a port to be set because we need that information when accessing `redis`,
        while `MemoryStore` do not require any further options.
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>The store-specific options, read more in corresponding section.</td>
    </tr>
    <tr>
      <td><code>ttl</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Live. The amount of time (<i>in seconds</i>) after which the stored resource data will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>tti</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Idle. If this amount of time has passed after the resource was last accessed, it will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
  </tbody>
</table>

---

<a name="memory"></a>
### In Memory Cache

In memory cache provider, this is the defaut provider.  This will use the available memory
in the javascript runtime.  This should only be used if your applcation is using a single
Node.JS process.


#### Usage

```javascript
var cacheOptions = {
  store: 'memory',
  ttl: 300,
  tti: 300
};

var client = new stormpath.Client({
  apiKey: apiKey,
  cacheOptions: cacheOptions
});
```

#### In-memory options

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
      <td><code>store</code></td>
      <td><code>string</code></td>
      <td>**required**</td>
      <td>String that must equal `memory`</td>
    </tr>

    <tr>
      <td><code>ttl</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Live. The amount of time (<i>in seconds</i>) after which the stored resource data will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>tti</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Interact. If this amount of time has passed after the resource was last accessed, it will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
  </tbody>
</table>

---

---


<a name="memcached"></a>
### Memcached

Memcached provider, use this option if you wish to use Memcahed as your cache storage.


#### Usage

```javascript
var cacheOptions = {
  store: 'memcached',
  connection: '127.0.0.1:11211',
  client: { /* optional - pass your own Memcached client instance */},
  options: {
    poolSize: 10
  },
  ttl: 300,
  tti: 300
};

var client = new stormpath.Client({
  apiKey: apiKey,
  cacheOptions: cacheOptions
});
```


#### Memcached options

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
      <td><code>store</code></td>
      <td><code>string|function</code></td>
      <td>**required**</td>
      <td> Should be equal to string `'memcached'`
        or reference to `MemcachedStore` constructor function.
      </td>
    </tr>
    <tr>
      <td><code>client</code></td>
      <td>
        `object`
      </td>
      <td>optional</td>
      <td>
        An instnace of `Memcached`, useful if you want to use an already-instantiated Memcached client
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td>
        <code>object</code>,<code>string</code>,<code>array</code>
      </td>
      <td>optional</td>
      <td>
        Passed to <code>new Memcached(<strong>Server locations</strong>, options);</code>.
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>
        <p>Passed to <code>new Memcached(Server locations, <strong>options</strong>);</code>.</p>
        <p>See the <a href="https://github.com/3rd-Eden/node-memcached" target="_blank">node-memcached docmenation</a> for complete option list.<p>
      </td>
    </tr>
    <tr>
      <td><code>ttl</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Live. The amount of time (<i>in seconds</i>) after which the stored resource data will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>tti</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Interact. If this amount of time has passed after the resource was last accessed, it will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
  </tbody>
</table>

---


<a name="redis"></a>
### Redis

Redis provider, use this option if you wish to use Redis as your cache storage.


#### Usage

```javascript
var cacheOptions = {
  store: 'redis',
  client: { /* optional - pass your own Redis client instance */},
  connection: {
    host: 'localhost',
    port: 6379
  },
  options: {
    return_buffers: false
  },
  ttl: 300,
  tti: 300
};

var client = new stormpath.Client({
  apiKey: apiKey,
  cacheOptions: cacheOptions
});
```


#### Cache options Parameters

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
      <td><code>store</code></td>
      <td><code>string|function</code></td>
      <td>**required**</td>
      <td> Should be equal to string `'redis'` or reference to `RedisStore` constructor function.
      </td>
    </tr>
    <tr>
      <td><code>client</code></td>
      <td>
        `object`
      </td>
      <td>optional</td>
      <td>
        An instnace of a Redis client, useful if you want to use an already-instantiated Redis client
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td>
        <code>object</code>
      </td>
      <td>optional</td>
      <td>
        An object that allows you to specity <code>host</code> or <code>port</code>, as strings, for your redis connection.  This is is passed to <code>redis.createClient(<strong>host</strong>, <strong>port</strong>, options)</code> and will default to 127.0.0.1 and 6379 if not provided.
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>
        <p>Options object that will be passed to <code>redis.createClient(host, port, <strong>options</strong>)</code>.</p>
        <p>See the <a href="https://github.com/mranney/node_redis" target="_blank">node-redis docmenation</a> for complete option list.</p>
      </td>
    </tr>
    <tr>
      <td><code>ttl</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Live. The amount of time (<i>in seconds</i>) after which the stored resource data will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>tti</code></td>
      <td><code>number</code></td>
      <td>optional</td>
      <td>Time To Interact. If this amount of time has passed after the resource was last accessed, it will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
  </tbody>
</table>

---

<a name="customNonceStore"></a>
### Custom Nonce Store

If you are using the [ID Site Feature][] in your Stormpath implementation, the calls to
[Application.createIdSiteUrl()](application#createIdSiteUrl) and [Application.handleIdSiteCallback()](application#handleIdSiteCallback)
will make use of a nonce value to prevent replay attacks.  By default these nonces will be stored in a cache region in the client's data store.

You may use your own Nonce Store by providing an interface object that we can use to communicate with it.  Your interface object must have these two methods:

* `getNonce(nonceStringValue,callback)` - It will search your nonce store for the nonce value and then call the callback with with the `(err,value)` pattern, where `err` indicates a problem with the store and `value` is the found nonce or `null`
* `putNonce(nonceStringValue,callback)` - It should place the nonce value in your nonce store and then call the callback with `(err)` where `err` is a store error or `null`

You then pass this object to the stormpath client constructor as the `nonceStore` option.

---


<a name="createApplication"></a>
### <span class="member">method</span> createApplication(application, *[options,]* callback)

Creates a new [Application](application) instance in the Client's
[Tenant](tenant).


#### Usage

Create a new Application with its own private Directory so you can start adding
user accounts right away:

```javascript
var app = {
  name: 'My Awesome App',
  description: 'Srsly. Awesome.'
};

client.createApplication(app, {createDirectory: true}, function(err, newApp) {
  console.log(newApp);
});
```

Create a new Application without any mapped user account stores.  You are
responsible for adding account stores later if you want to be able to create
new user accounts via the application directly.  Notice there is no
_options_ param:

```javascript
var app = {
  name: 'My Awesome App',
  description: 'Srsly. Awesome.'
};

client.createApplication(app, function(err, newApp) {
  console.log(newApp);
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

The created `Application` returned from the server will be provided to the `callback` as the callback's second parameter.

---


<a name="createDirectory"></a>
### <span class="member">method</span> createDirectory(directory, *[options,]* callback)

Creates a new [Directory](directory) instance in the Client's [Tenant](tenant).


#### Usage

```javascript
var dir = {
  name: 'Employees Directory',
  description: 'Only Employee accounts in here please.'
};

client.createDirectory(dir, function(err, newDir) {
  console.log(newDir);
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

The created `Directory` returned from the server will be provided to the
`callback` as the callback's second parameter.

---


<a name="getAccount"></a>
### <span class="member">method</span> getAccount(accountHref, *[options,]* callback)

Retrieves the [Account](account) resource at `accountHref` and provides it to
the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is
an `Account`: it is assumed that the caller knows the `href` represents an
account location.


#### Usage

For an `href` that you know represents an account:

```javascript
client.getAccount(href, function(err, account) {
  console.log(account);
});
```

You can specify query parameters as the **options** argument, for example, for
[resource expansion][]:

```javascript
client.getAccount(href, {expand: 'customData'}, function(err, account) {
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
      <td>An object literal of name/value pairs to use as query parameters, for example, [resource expansion][].</td>
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

The retrieved `Account` resource will be provided to the `callback` as the callback's second parameter.

---


<a name="getApplication"></a>
### <span class="member">method</span> getApplication(applicationHref, *[options,]* callback)

Retrieves the [Application](application) resource at `applicationHref` and
provides it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is
an `Application`: it is assumed that the caller knows the `applicationHref`
represents an application location.


#### Usage

For an `applicationHref` that you know represents an application:

```javascript
client.getApplication(href, function(err, app) {
  console.log(app);
});
```

You can specify query parameters as the **options** argument, for example, for
[resource expansion][]:

```javascript
client.getApplication(href, {expand: 'accounts'}, function(err, app) {
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
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion][].</td>
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

The retrieved `Application` resource will be provided to the `callback` as the
callback's second parameter.

---


<a name="getApplications"></a>
### <span class="member">method</span> getApplications(*[options,]* callback)

Retrieves a [collection](collectionResource) of [Tenant](tenant)
[Application](application)s and provides the collection to the specified
`callback`.

If no options are specified, all of the client tenant's applications are
retrieved.  If options (*query parameters*) are specified for a search, only
those applications matching the search will be retrieved.  If the search
does not return any results, the collection will be empty.


#### Usage

If you want to retrieve *all* of your tenant's applications:

```javascript
client.getApplications(function(err, applications) {

  applications.each(function(app, callback) {
    console.log(app);
    callback();
  }, function(err) {

  });
});
```

As you can see, the [Collection](collectionResource) provided to the `callback`
has an `each` function that accepts its own callback.  The collection will
iterate over all of the applications in the collection, and invoke the callback
for each one.

If you don't want all applications, and only want specific ones, you can search
for them by specifying the *options* argument with [application search][]
query parameters:

```javascript
client.getApplications({name: '*Awesome*'}, function(err, apps) {

  applications.each(function(app, callback) {
    console.log(app);
    callback();
  }, function(err) {

  });
});
```

The above code example would only print out applications with the text fragment
`Awesome` in their name.  See the Stormpath [application search documentation][]
for other supported query parameters, such as reference expansion.


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

The retrieved collection of `Application`s will be provided to the `callback`
as the callback's second parameter.

---


<a name="getCurrentTenant"></a>
### <span class="member">method</span> getCurrentTenant(*[options,]* callback)

Retrieves the client's [Tenant](tenant) and provides it to the specified `callback`.


#### Usage

```javascript
client.getCurrentTenant(function(err, tenant) {
  console.log(tenant);
});
```

You can also use [resource expansion][] options (query params) to obtain
linked resources in the same request:

```javascript
client.getCurrentTenant({expand:'applications'}, function(err, tenant) {
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

The retrieved `Tenant` resource will be provided to the `callback` as the callback's second parameter.

---


<a name="getDirectories"></a>
### <span class="member">method</span> getDirectories(*[options,]* callback)

Retrieves a [collection](collectionResource) of [Tenant](tenant)
[Directories](directory) and provides the collection to the specified
`callback`.

If no options are specified, all of the client tenant's directories are
retrieved.  If options (*query parameters*) are specified for a search, only
those directories matching the search will be retrieved.  If the search does
not return any results, the collection will be empty.


#### Usage

If you want to retrieve *all* of your tenant's directories:

```javascript
client.getDirectories(function(err, directories) {

  directories.each(function(dir, callback) {
    console.log(dir);
    callback();
  }, function(err) {

  });
});
```

As you can see, the [Collection](collectionResource) provided to the `callback`
has an `each` function that accepts its own callback.  The collection will
iterate over all of the directories in the collection, and invoke the callback
for each one.

If you don't want all directories, and only want specific ones, you can search
for them by specifying the *options* argument with [directory search][]
query parameters:

```javascript
client.getDirectories({name: '*foo*'}, function(err, directories) {


  directories.each(function(dir, callback) {
    console.log(dir);
    callback();
  }, function(err) {

  });
});
```

The above code example would only print out directories with the text fragment
`foo` in their name.  See the Stormpath [directory search documentation][] for
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

The retrieved collection of `Directory` resources will be provided to the
`callback` as the callback's second parameter.

---


<a name="getDirectory"></a>
### <span class="member">method</span> getDirectory(directoryHref, *[options,]* callback)

Retrieves the [Directory](directory) resource at `directoryHref` and provides
it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is a
`Directory`: it is assumed that the caller knows the `directoryHref` represents
a directory location.


#### Usage

For a `directoryHref` that you know represents a directory:

```javascript
client.getDirectory(href, function(err, dir) {
  console.log(dir);
});
```

You can specify query parameters as the **options** argument, for example, for
[resource expansion][]:

```javascript
client.getDirectory(href, {expand: 'accounts'}, function(err, dir) {
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

The retrieved `Directory` resource will be provided to the `callback` as the
callback's second parameter.

---


<a name="getGroup"></a>
### <span class="member">method</span> getGroup(groupHref, *[options,]* callback)

Retrieves the [Group](group) resource at `groupHref` and provides it to the
specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is a
`Group`: it is assumed that the caller knows the `groupHref` represents a group
location.


#### Usage

For a `groupHref` that you know represents a group:

```javascript
client.getGroup(href, function(err, group) {
  console.log(group);
});
```

You can specify query parameters as the **options** argument, for example, for
[resource expansion][]:

```javascript
client.group(href, {expand: 'accounts'}, function(err, group) {
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

The retrieved `Group` resource will be provided to the `callback` as the
callback's second parameter.

---


<a name="getGroupMembership"></a>
### <span class="member">method</span> getGroupMembership(href, *[options,]* callback)

Retrieves the [GroupMembership](groupMembership) resource at `href` and
provides it to the specified `callback`.

**NOTE**: This implementation does not validate that the returned resource is
a `GroupMembership`: it is assumed that the caller knows the `href` represents
a group location.


#### Usage

For an `href` that you know represents a GroupMembership:

```javascript
client.getGroupMembership(href, function(err, membership) {
  console.log(membership);
});
```

You can specify query parameters as the **options** argument, for example, for
[resource expansion][]:

```javascript
client.getGroupMembership(href, {expand: 'account,group'}, function(err, membership) {
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

The retrieved `GroupMembership` resource will be provided to the `callback` as
the callback's second parameter.

  [Redis]: http://redis.io/ "Redis"
  [Stormpath API key]: http://docs.stormpath.com/rest/quickstart/#get-an-api-key "Stormpath API Key"
  [resource expansion]: http://docs.stormpath.com/rest/product-guide/#account-retrieve "Stormpath Resource Expansion"
  [application search]: http://docs.stormpath.com/rest/product-guide/#tenant-applications-search "Stormpath Application Search"
  [application search documentation]: http://docs.stormpath.com/rest/product-guide/#tenant-applications-search "Stormpath Application Search"
  [directory search]: http://docs.stormpath.com/rest/product-guide/#tenant-directories-search "Stormpath Directory Search"
  [directory search documentation]: http://docs.stormpath.com/rest/product-guide/#tenant-directories-search "Stormpath Directory Search"
  [ID Site Feature]: http://docs.stormpath.com/guides/using-id-site
