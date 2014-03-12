## ApiKey

An `ApiKey` represents a Stormpath customer's API-specific ID and secret. All Stormpath REST invocations must be authenticated with an ApiKey. API Keys are assigned to *individual people*. Never share your API Key with anyone, not even co-workers.  API Keys can be generated for your tenant by following [Stormpath API Key Documentation](http://docs.stormpath.com/rest/quickstart/#get-an-api-key)

There are two easy ways to obtain an `ApiKey` instance:

* Reference your downloaded `apiKey.properties` file (for example, in `$HOME/.stormpath/apiKey.properties`):

    ```javascript
    var stormpath = require('stormpath');

    //Reference apiKey.properties in the process user's home dir.  Works on both Windows and *nix systems:
    var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
    var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

    var client = null; //available after the ApiKey file is asynchronously loaded from disk

    stormpath.loadApiKey(apiKeyFilePath, function apiKeyFileLoaded(err, apiKey) {
      if (err) throw err;

      //apiKey has been loaded from disk - use it to create a client:
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
### <span class="member">constructor</span> ApiKey(id, secret)

The `ApiKey` constructor function creates a new `ApiKey` instance according to the specified `id` and `secret` arguments.  The `ApiKey` is passed to the `Client` constructor as part of its initialization.

#### Usage

You must `require('stormpath')` to access the constructor function:

```javascript
var stormpath = require('stormpath');

//In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

var client = new stormpath.Client({apiKey: apiKey});
```

**WARNING:** Never hard-code your API Key Secret value in source code!  API Key IDs and Secrets are tied to a specific
person - no-one other than you should ever see your API Key Secret, otherwise they could impersonate you.

#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| id          | string          | required   | The id for your API Key
| secret      | string          | required   | The string for your API Key

#### Returns

A new `ApiKey` instance with the specified API ID and Secret

---

<a name="toString"></a>
### <span class="member">method</span> toString()

`toString()` is a utility method to get the string representation of the `ApiKey`.  The `toString()` function will not output the secret for the `ApiKey`

#### Usage

```javascript
var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

console.log(apiKey.toString());

```

#### Returns

A string that represents the `ApiKey` in the following format

```javascript
'id: ' + this.id + ', secret: <hidden>'

```
---
