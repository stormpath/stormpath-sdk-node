## ApiKey

An `ApiKey` represents a Stormpath customer's API-specific ID and secret.  All
Stormpath REST calls must be authenticated with an API key.  API keys are
assigned to *individual people*.  Never share your API key with anyone, not
even co-workers.

To learn more about API keys (*including how to create them*), you might want
to check out the [Stormpath API Key Documentation][].

There are two easy ways to obtain an `ApiKey` instance:

* Reference your downloaded `apiKey.properties` file (*for example,
  `~/.stormpath/apiKey.properties`*):

  ```javascript
  var stormpath = require('stormpath');

  // Platform independent way to grab the user's home directory.
  var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
  var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

  // Available after the properties file is asynchronously loaded from disk.
  var client;

  stormpath.loadApiKey(apiKeyFilePath, function(err, apiKey) {
    if (err) throw err;
    client = new stormpath.Client({apiKey: apiKey});
  });
  ```

* Create an `ApiKey` object manually:

  ```javascript
  var stormpath = require('stormpath');

  // In this example, we'll reference the values from the environment (*NEVER
  // HARDCODE API KEY VALUES IN SOURCE CODE!*).
  var apiKey = new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  );

  var client = new stormpath.Client({apiKey: apiKey});
  ```

**Since**: 0.1

---


<a name="ctor"></a>
### <span class="member">constructor</span> ApiKey(id, secret)

The `ApiKey` constructor function creates a new `ApiKey` instance according to
the specified `id` and `secret` arguments.  The `ApiKey` is passed to the
`Client` constructor as part of its initialization.


#### Usage

You must `require('stormpath')` to access the constructor function:

```javascript
var stormpath = require('stormpath');

var apiKey = new stormpath.ApiKey(
  process.env['STORMPATH_API_KEY_ID'],
  process.env['STORMPATH_API_KEY_SECRET']
);
```

**WARNING:** Never hard-code your API key secret value in source code!  API key
IDs and secrets are tied to a specific person -- no-one other than you should
ever see your API key secret, otherwise they could impersonate you.


#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| id          | string          | required   | The id for your API key.
| secret      | string          | required   | The string for your API key.


#### Returns

A new `ApiKey` instance with the specified API ID and secret.

---


<a name="toString"></a>
### <span class="member">method</span> toString()

`toString()` is a utility method to get the string representation of the
`ApiKey`.  The `toString()` method will not output the secret for the `ApiKey`.


#### Usage

```javascript
var apiKey = new stormpath.ApiKey(
  process.env['STORMPATH_API_KEY_ID'],
  process.env['STORMPATH_API_KEY_SECRET']
);

console.log(apiKey.toString());
```


#### Returns

A string that represents the `ApiKey` in the following format:

```javascript
'id: ' + this.id + ', secret: <hidden>'
```

---


  [Stormpath API Key Documentation]: http://docs.stormpath.com/rest/quickstart/#get-an-api-key "Stormpath API Key Documentation"
