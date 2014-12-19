## Application

An `Application` in Stormpath represents any real world piece of software that communicates with Stormpath to offload its user management and authentication needs - like a Node.js application.

You control who may login to an application by assigning (or ‘mapping’) one or more [Directories](directory) or [Groups](group) (generically both called _account stores_) to an application. The Accounts in these associated directories or groups (again, _account stores_) collectively form the application’s user base. These accounts are considered the application’s users and they can login to the application. Therefore, you can control user population that may login to an application by managing which account stores are assigned to the application.

Even the Stormpath Admin Console and API is represented as an `Application` (named 'Stormpath'), so you can control who has administrative access to your Stormpath tenant by managing the Stormpath application’s associated account stores.

**Since**: 0.1

---

<a name="authenticateAccount"></a>
### <span class="member">method</span> authenticateAccount(authenticationRequest, callback)

Performs an authentication attempt for an application account via the supplied `authenticationRequest` argument, providing the returned [AuthenticationResult](authenticationResult) to the specified `callback`.

#### Usage

Authenticate your application user accounts with a simple username/password pair:

```javascript
var authcRequest = {
  username: 'jlpicard', //username can be an email address too
  password: 'RawPassw0rd!'
};

application.authenticateAccount(authcRequest, function onAuthcResult(err, result) {

  //if successful, the result will have an account field with the successfully authenticated account:

  result.getAccount(function(err, account) {
    console.log(account);
  });
};
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
      <td>`authenticationRequest`</td>
      <td>`object`</td>
      <td>required</td>
      <td>Object with two required name/value pairs: `username` and `password` and one optional `accountStore`.  `username` can be either a username or email address. `password` is the _raw_ password submitted directly by your application user.  Stormpath hashes and encrypts this value securely automatically - you don't have to do anything special before submitting to Stormpath. If you desire to target a specific `accountStore`, then provide reference to the `accountStore` in options.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is an [AuthenticationResult](authenticationResult) instance that contains the successfully authenticated account available via its `getAccount` method, for example, `result.getAccount(function(err, account){...});`.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; If the authentication fails, the callback's first parameter (`err`) will report the failure.  If the authentication succeeds, the success [AuthenticationResult](authenticationResult) will will be provided to the `callback` as the callback's second parameter.  The successfully authenticated account may be obtained via the result's `getAccount` method, for example, `result.getAccount(function(err, account){...});`.

---

<a name="authenticateApiRequest"></a>

### <span class="member">method</span> authenticateApiRequest(options, callback)

This method gives you the ability to perform API Key Authentication for your users, as described in [Using Stormpath to Secure and Manage API Services](http://docs.stormpath.com/guides/securing-your-api/)

Used this method to:

 * Authenticate users who wish to identify themselves with an ApiKey that has been created on their [Account](account).
 * Allow those same users to exchange their ApiKey credentials for an Oauth Access tken
 * Auuthenticate a user who has an Oauth Access token that you have issued to them


The user will supply the necessary information to you by making an HTTP request to your server.  You will pass that request, using the `options.request` paramter, to this method.  This method will to do one of the following, based on the nature of the request:

* Authenticate the user via HTTP Basic Auth, if the `Authorization` header exists with a value of `Basic <Base64 Encoded api_key_id:api_key_secret>`.
* Create an Oauth access token if authorization is successful and a token is requested by `grant_type=client_credentials` in the URL or post body.
* Authenticate the user, using a previously issued Oauth access token which must be provided in one of these locations:
 * In the header as `Authorization: Bearer <token>`
 * As the value of the `access_token` field in a `application/www-url-form-encoded` post body
 * As that value of the `access_token` query parameter in the request URL.  This is not recommened, as query parameters are typically logged in system logs and this would compromise the token.  The URL location must be specifically enabled (see parameters table below).

In all situations the `callback` will be called with either an error, which is descriptive and can be passed back to the user, or an instance of `AuthenticationResult`, which will have the requested or granted scopes, if this is an Oauth type of request.

If you will use form-encoded post bodies to pass the `grant_type` or `access_token`: it is assumed that you are using a framework such as Express or Restify and that you have enabled the `bodyParser` in order to populate `req.body` as an object before passing the request to this function.  If you do not this method will assume that no post body is present and will not find any values there.

This method is useful if you want to support all these operations under one route handler and with one call to our API.

#### Usage

If you are using a framework such as Express or Restify, just pass along the request object to do basic authoriztion:
Pass an object as the first parmeter, and assign the HTTP request to the `request` property.  For example:

```javascript
// Express.js example - accept Basic or OAuth Access Token for a given resource

app.get('/protected/resource',function (req,res){
  application.authenticateApiRequest({
    request: req
  },function(err,authResult){
    authResult.getAccount(function(err,account){
      var message = 'Hello, ' + account.username + '! Thanks for authenticating.';
      if(authResult.grantedScopes){
        message += ' You have been granted: ' + authResult.grantedScopes.join(' ');
      }
      res.json({message: message });
    });
  });
});
```

Or if you want to support Oauth Access Token exchange:

```javascript
// Express.js example - support the exchange of api key credentials for an Oauth Access Token

app.post('/oauth/token',function (req,res){
  application.authenticateApiRequest({
    request: req,
    scopeFactory: function(account,requestedScopes){
      // determine what scope to give, then return
      return ['granted-scope'];
    }
  },function(err,authResult){
    res.json(authResult.tokenResponse);
  });
});
```


If you are not using a framework, you may manually construct an object literal for the `request` value:

```javascript
// Example object literal for the request, this example is an Oauth Access Token request.

var requestObject = {
  url: '/oauth/token',
  method: 'POST',
  headers:{
    'authorization': 'Basic 3HR937281K7QWC5YS37289WPE:MTdncVDALvHcdoY3sjrK+/WgYY3sj3AZx1vZx1v'
  },
  body:{
    grant_type: 'client_credentials'
  }
};

application.authenticateApiRequest({ request: requestObject },function(err,authResult){
  // .. handle the result
})


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
      <td>`options`</td>
      <td>`object`</td>
      <td>required</td>
      <td>
        <p>An object literal, with the following properties:</p>
        <ul>
          <li> `request` - REQUIRED - this can be the `req` object from your framework, or an object literal with the following properties:
            <ul>
              <li>`url` - REQUIRED - the url of the reuqest, including query parameters</li>
              <li>`method` - REQUIRED - the method of the request, GET or POST depending on the type of request</li>
              <li>`headers` - REQUIRED - an object with an optional `authorization` property</li>
              <li>`body` - OPTIONAL - an object where the properties corresponded to the form data that was posted</li>
            </ul>
          </li>
        </ul>
        <ul>
          <li> `locations` - OPTIONAL - Where to look for an `access_token` in the request.
            It is an array of strings which may contain any of thes values:
            <ul>
              <li>'header'</li>
              <li>'body'</li>
              <li>'url'</li>
            </ul>
            Defaults to `'header'` and `'body'`.  <strong>WARNING:</strong> enabling `url` is discouraged, passing the `access_token` in the
            URL may cause it to be logged in a system log, at which point it would be comprimised.
          </li>
        </ul>
        <ul>
          <li>
            `scopeFactory` - OPTIONAL - A function which will be called with `(account,requestedScopes)` where the account is the
            successfully authenticated account and `requstedScope` is the scope(s) that the user requested, as an array of strings.  You must return
            the scope(s) you wish to grant, as an array of strings.
          </li>
        </ul>
        <ul>
          <li>`ttl` - OPTIONAL - A number, how many seconds this token is valid for.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>
        <p>The callback that will receive the error or an instance of `AuthenticationResult`.  You can inspect `authResult` for the following properties:</p>
        <ul>
          <li>`tokenResponse` - The object that you should send to the user as a JSON string, if they have requested an Oauth Access token</li>
          <li>`grantedScopes` - The scope(s) that the user can access, given the access token that they presented.  It is an array of strings.</li>

        </ul>

      </td>
    </tr>
  </tbody>
</table>

---

<a name="createAccount"></a>
### <span class="member">method</span> createAccount(account, *[options,]* callback)

Creates a new [Account](account) in the application's [default account store](http://docs.stormpath.com/rest/product-guide/#account-store-mapping-default-account-store).

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

application.createAccount(account, function onAccountCreated(err, createdAccount) {
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

application.createAccount(account, function onAccountCreated(err, createdAccount) {
  console.log(createdAccount);
});
```

You can also specify options to control creation behavior and things like reference expansion:

```javascript
...

var options = {registrationWorkflowEnabled: false, expand: 'directory'};

application.createAccount(account, options, function onAccountCreated(err, createdAccount) {
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

Creates a new [Group](group) in the application's [default group store](http://docs.stormpath.com/rest/product-guide/#account-store-mapping-default-group-store).

#### Usage

Example:

```javascript
var group = {name: 'Administrators'}

application.createGroup(group, onGroupCreation(err, createdGroup) {
  console.log(createdGroup);
});
```

You can also specify options to control things like reference expansion:

```javascript
application.createGroup(group, {expand:'directory'}, function onAccountCreated(err, createdGroup) {
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

<a name="createIdSiteUrl"></a>
### <span class="member">method</span> createIdSiteUrl(options)

Creates a URL which will redirect a user to your ID Site.  The URL will have the query param `?jwtRequest=<token>` appended to it.
This token is required when sending a user to your ID Site and is signed with your api key for protection.  To send the user to your ID site, simply Issue a `302` redirect and set the `Location` header to the URL that you get from this method.

For more information, see the [ID Site Feature Guide][]

#### Usage

````javascript
// Express.js example

app.get('/login',function(req,res){
  var url = application.createIdSiteUrl({
    callbackUri: 'https://www.mysite.com/dashboard'
  });

  res.writeHead(302, {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'Location': url
  });
  res.end();
});

app.get('/logout',function(req,res){
  var url = application.createIdSiteUrl({
    callbackUri: 'https://www.mysite.com/home',
    logout: true
  });

  res.writeHead(302, {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'Location': url
  });
  res.end();
});
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
      <td>`options`</td>
      <td>`object`</td>
      <td>required</td>
      <td>
        <p>An options object, the following properties are supported:</p>
        <ul>
          <li>
            `callbackUri` - REQUIRED - the fully-qualified location where the user should be sent after they authenticate,
            e.g. *https://www.mysite.com/dashboard*.
            For security reasons, the domain *www.mysite.com* must be registered in your ID Site configuration in the Stormpath Admin Console.
          </li>
          <li>
            `logout` - OPTIONAL - If true, the user will be logged out of their session
            and redirected to the sepcified callbackUri.
          </li>
          <li>
            `path` - OPTIONAL - Sets the initial path in the ID Site where the user should be sent. If unspecified, this defaults to /, implying that the ID Site's landing/home page is the desired location.

            Most Stormpath customers allow their ID Site's default landing page `/` to reflect a traditional 'Login or Signup' page for convenience.
            However, if you know that an end-user is attempting to register, and your ID Site's user registration form is located at /register, you would set the path to `/register` to send the user directly there.
            For example, if you are using the default ID Site provided by Stormpath, you can send the user directly to the registration page by specifying `/#/register` or the forgot password page by specifying `/#/forgot`
          </li>
          <li>
            `state` - OPTIONAL - Application-specific state that should be retained and made available to your callbackUri when
            the user returns from the ID Site.  See [handleIdSiteCallback](application#handleIdSiteCallback)
          </li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

---

<a name="getAccounts"></a>
### <span class="member">method</span> getAccounts(*[options,]* callback)

Retrieves a [collection](collectionResource) of the application's accessible [Account](account)s and provides the collection to the specified `callback`.

If no options are specified, all of the application's accounts are retrieved.  If options (query parameters) are specified for a search, only those accounts matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the application's accounts:

```javascript
application.getAccounts(function(err, accounts) {
  accounts.each(function(err, account, offset) {
    console.log('Offset ' + offset + ', account: ' + account);
  });
});
```
As you can see, the [Collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the accounts in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the account in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all accounts, and only want specific ones, you can search for them by specifying the _options_ argument with [application account search](http://docs.stormpath.com/rest/product-guide/#application-accounts-search) query parameters:

```javascript
application.getAccounts({username: '*foo*'}, function(err, accounts) {
  accounts.each(function(err, account) {
    console.log(account);
  });
});
```
The above code example would only print out accounts with the text fragment `foo` in the username.  See the Stormpath REST API Guide's [application account search documentation](http://docs.stormpath.com/rest/product-guide/#application-accounts-search) for other supported query parameters, such as reference expansion.

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
      <td>Name/value pairs to use as query parameters, for example, for [application account search](http://docs.stormpath.com/rest/product-guide/#application-accounts-search) or reference expansion.</td>
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

<a name="getApiKey"></a>
### <span class="member">method</span> getApiKey(apiKeyId, <em>[options,]</em> callback)

Retrieves the specified ApiKey for an Account that may login to the Application (as determined by the application's [mapped account stores](accountStoreMapping) ). If the API Key does not correspond to an Account that may login to the application, and error is provided to the callback.

When retrieving the API Key from Stormpath, it is doubly encrypted: in transit over SSL by default, but also the API Key secret is additionally encrypted to ensure that nothing before or after SSL transit may even see the secret.  Additionally, API Key secret values remain encrypted if caching is enabled, so you don’t have to worry if your cache supports encryption.

This all happens by default; there is nothing you need to configure to obtain these benefits.  However, if you would like to customize the secondary encryption options, you may do so:

For those interested, password-based AES 256 encryption is used: the password is the API Key Secret you used to configure the SDK Client.  The PBKDF2 implementation will use 1024 iterations by default to derive the AES 256 key.  At the risk of potentially decreased security, you can use the `options` argument to specify a lower level of encryption key size, like 192 or 128.  You can also request a lower number of key iterations. This can reduce the CPU time required to decrypt the key after transit or when retrieving from cache. It is not recommended to go much lower than 1024 (if at all) in security sensitive environments.

#### Usage

````javascript
application.getApiKey('an api key id',function(err,apiKey){
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
      <td>`apiKeyId`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The Api Key Id for which you want the matching account.</td>
    </tr>
    <tr>
      <td><em>`options`</em></td>
      <td>`object`</td>
      <td><em>optional</em></td>
      <td>
        <p>An object which allows you to modify the query parameters for this request, the following properties are valid:</p>
        <ul>
          <li>`encryptionKeySize` - Set to `128` or `192` to change the AES key encryption size</li>
          <li>`encryptionKeyIterations` - Defaults to `1024`</li>
        </ul>

      </td>
    </tr>
    <tr>
    <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>
        The function to call when the request is complete,
        it will be called with an error or an `ApiKey` instance which contains an
        expanded `account` property.
      </td>
    </tr>
  </tbody>
</table>

---

<a name="getCustomData"></a>
### <span class="member">method</span> getCustomData(*[options,]* callback)

Retrieves the [CustomData](customData) resource of the `Application` and provides
it to the specified `callback`.


#### Usage

```javascript
application.getCustomData(function(err, customData) {
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

Retrieves a [collection](collectionResource) of the application's accessible [Group](group)s and provides the collection to the specified `callback`.

If no options are specified, all of the application's groups are retrieved.  If options (query parameters) are specified for a search, only those groups matching the search will be retrieved.  If the search does not return any results, the collection will be empty.

#### Usage

If you want to retrieve _all_ of the application's groups:

```javascript
application.getGroups(function(err, groups) {
  groups.each(function(err, group, offset) {
    console.log('Offset ' + offset + ', group: ' + group);
  });
});
```
As you can see, the [collection](collectionResource) provided to the `callback` has an `each` function that accepts its own callback.  The collection will iterate over all of the groups in the collection, and invoke the callback for each one.  The `offset` parameter indicates the index of the group in the returned collection.  The `offset` parameter is optional - it may be omitted from the callback definition.

If you don't want all groups, and only want specific ones, you can search for them by specifying the _options_ argument with [application group search](http://docs.stormpath.com/rest/product-guide/#application-groups-search) query parameters:

```javascript
application.getGroups({name: '*bar*'}, function(err, groups) {
  groups.each(function(err, group) {
    console.log(group);
  });
});
```
The above code example would only print out groups with the text fragment `foo` in their name.  See the Stormpath REST API Guide's [application group search documentation](http://docs.stormpath.com/rest/product-guide/#application-groups-search) for other supported query parameters, such as reference expansion.

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
      <td>Name/value pairs to use as query parameters, for example, for [application group search](http://docs.stormpath.com/rest/product-guide/#application-groups-search) or reference expansion.</td>
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

Retrieves the application's owning [Tenant](tenant) and provides it to the specified `callback`.

#### Usage

```javascript
application.getTenant(function(err, tenant) {
  console.log(tenant);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
application.getTenant({expand:'directories'}, function(err, tenant) {
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

<a name="handleIdSiteCallback"></a>
### <span class="member">method</span> handleIdSiteCallback(requestUrl, callback)

This method should be called when processing an HTTP request sent by the ID Site to the `callbackUri` specified via the [createIdSiteUrl()](application#createIdSiteUrl) method.  You should provide the entire URL of the request, including all query paramaters.

For more information, see the [ID Site Feature Guide][]

#### Usage

```javascript
// Express.js example, assumes you set '/dashboard' as the callbackUri when calling application.createIdSiteUrl()

app.get('/dashboard',function(req,res){
  application.handleIdSiteCallback(req.url,function(err,idSiteResult){
    var account = idSiteResult.account;
    // render the user dashboard for this account
  });
})
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
      <td>`requestUrl`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The request URL, including all query parameters</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute when the method is complete.  If successful, an `idSiteResult` result will be
      given as the second argument.  Otherwise and error will be returned as the first argument.</td>
    </tr>
  </tbody>
</table>

#### *Object* idSiteResult {}

This object represents a successful ID Site callback and has the following properties:

 | name | type | description |
 | - | - | - |
 | `account` | `object` `Account` | The account that was authenticated, this is an instance of [Account](account)
 | `isNew` | `boolean` | A boolean indicating if this account was newly registered at the ID Site
 | `state` | `string` | The application-specific state you you passed as an option to [createIdSiteUrl()](application#createIdSiteUrl)
 | `status` | `string` | Indicates the user activty on the ID Site.  `AUTHENTICATED` if the user has authenticated, or `LOGOUT` if the user has logged out. |

---

<a name="sendPasswordResetEmail"></a>
### <span class="member">method</span> sendPasswordResetEmail(email, callback)

Triggers the [password reset workflow](http://docs.stormpath.com/rest/product-guide/#application-password-reset) for an application account matching the specified `email` (and of course, sends an email to that account's email address).  This will result in a newly created `PasswordResetToken` resource which will be provided to the specified `callback`.  The corresponding account is accessible as a field on the provided `PasswordResetToken` object.

#### Usage

```javascript
application.sendPasswordResetEmail(email, function(err, passwordResetToken) {

  console.log(passwordResetToken);

  //the passwordResetToken indicates to which account the email was sent:

  console.log(passwordResetToken.account);
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
      <td>`email`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The email address of an account that may login to the application.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is an `PasswordResetToken` that references the emailed account via its `account` field, for example, `passwordResetToken.account`.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; If an account with the specified email is not found, the callback's first parameter (`err`) will report the failure.  If the account is found, the passwordResetToken result will be provided to the `callback` as the callback's second parameter.  The emailed account may be obtained via the passwordResetToken's `account` field, for example `passwordResetToken.account`.

---

<a name="verifyPasswordResetToken"></a>
### <span class="member">method</span> verifyPasswordResetToken(token, callback)

Continues the [password reset workflow](http://docs.stormpath.com/rest/product-guide/#application-password-reset) by verifying a token discovered in a URL clicked by an application end-user in an email.  If the token is valid, the associated Stormpath account will be retrieved.  After retrieving the account, you collect a new password from the end-user and relay that password back to Stormpath.

#### Usage

```javascript

var sptoken = request.query.sptoken; // get the sptoken from the request URL

application.verifyPasswordResetToken(sptoken, function(err, verificationResponse) {

  /*
    If the token is valid and exists (there is no err), you can set the new
    password on this response and call save().  This will consume the token (it
    can't be used again) and will send the user an email, confirming that their
    password has been changed.
  */

  verificationResponse.password = 'a new password';
  verificationResponse.save();
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
      <td>`token`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The `sptoken` query parameter in a [password reset workflow](http://docs.stormpath.com/rest/product-guide/#application-password-reset).</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError) if the token is not found or has expired.  The 2nd parameter, a
        `verificationResponse`, can be used to set a new password and complete the flow.</td>
    </tr>
  </tbody>
</table>


#### *Object* verificationResponse {}

This object represents a found password reset token and the account that it was created for

 | Property Name | Type | Description |
 | - | - | - |
 | `account` | `object` | Contains an `href` property which indicates the account which this token is for
 | `email` | `string` | The email address which received this password reset token
 | `password` | `string` | Initially null, set this to a string to indicate a new password
 | `save()` | `function` | The method to call after you set a new password, using the `password` property


---

<a name="resetPassword"></a>
### <span class="member">method</span> resetPassword(token, password, callback)

Continues the [password reset workflow](http://docs.stormpath.com/rest/product-guide/#application-password-reset) by setting a new password for an account. On success, the response will include a link to the account that the password was reset on. This call on success will send the password change confirmation email that was configured in the Administrator Console to the email account associated with the account.

#### Usage

```javascript

var token = req.body.token;
var password = req.body.password;

application.resetPassword(token, password, function(err, account) {
    // link to the account, which is associated with this password reset workflow
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
      <td>`token`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The `sptoken` query parameter in a [password reset workflow](http://docs.stormpath.com/rest/product-guide/#application-password-reset).</td>
    </tr>
    <tr>
      <td>`password`</td>
      <td>`string`</td>
      <td>required</td>
      <td>The `password` parameter in a [password reset workflow](http://docs.stormpath.com/rest/product-guide/#application-password-reset). Will be set as account password.</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is the account associated with the reset token.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; If an account with the specified password reset token is not found, the callback's first parameter (`err`) will report the failure.  If the account is found, new `password` will be set and it will be provided to the `callback` as the callback's second parameter.

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(providerOptions, *[options,]* callback)

Retrieves or creates an `Account` if the application has an associated `Account Store` which
is a social provider store.  The specified `callback` is called with an error or `providerAccountResult` object.

For a detailed explanation of how to retrieve access tokens from Facebook or Google,
please read [Integrating Stormpath with Facebook and Google](http://docs.stormpath.com/guides/social-integrations/)
and review the samples folder in the SDK.

#### Usage

In this example we have obtained a Google access token from the user
and we are using it to fetch the associated account from Stormpath.

```javascript

var options = {
  providerData: {
    providerId: 'google',
    accessToken: 'abc1235'
  }
};

application.getAccount(options, function(err, providerAccountResult) {

  if(providerAccountResult.created){
    console.log('Just created a new user');
  }

  console.log(providerAccountResult.account);
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
      <td>`providerOptions`</td>
      <td>`object`</td>
      <td>required</td>
      <td>
        An object literal, with the following properties:
        <ul>
          <li>`providerData` - REQUIRED - an object literal with the following properties:</li>
          <ul>
            <li>`providerId` - REQUIRED - either 'google' or 'facebook'</li>
            <li>`accessToken` - OPTIONAL - the access token that you have acquired from the provider.  Use this if you have not requested offline access to the user's data.</li>
            <li>`code` - OPTIONAL - the access code that you have acquired from the provider.  Use this if you HAVE requested offline access to the user's data.</li>
          </ul>
        </ul>
    </tr>
    <tr>
      <td>`options`</td>
      <td>`object`</td>
      <td>optional</td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion).</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval.
        The 1st parameter is an `Error` object.
        The 2nd parameter is the retrieved `ProviderData` resource.
      </td>
    </tr>
  </tbody>
</table>

#### *Object* providerAccountResult {}

This object represents a successful retrieval or creation of the Stormpath Account that is
associated with the user that provided the access token.

 | name | type | description |
 | - | - | - |
 | `account` | `object` `Account` | The account that was authenticated, this is an instance of [Account](account)
 | `created` | `boolean` | A boolean indicating if this account was newly created

---

<a name="getAccountStoreMappings"></a>
### <span class="member">method</span> getAccountStoreMappings(*[options,]* callback)

Retrieves the Collection of `AccountStoreMappings` and provides it to the specified `callback`.

#### Usage


```javascript
application.getAccountStoreMappings({expand: 'accountStore'}, function(err, asm){
  var accountStoreMappings = asm;
})

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
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter
      is an [AccountStoreMapping](accountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

void;
If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, the instance of  [AccountStoreMapping](accountStoreMapping) will be provided to the `callback` as the callback's second parameter.

---

<a name="getDefaultAccountStore"></a>
### <span class="member">method</span> getDefaultAccountStore(*[options,]* callback)

Retrieve a default `AccountStoreMapping` for storing accounts and provides it to the specified `callback`.
If default Account Store not set, `callback` will be called without parameters.

#### Usage


```javascript
application.getDefaultAccountStore({expand: 'accountStore'}, function(err, asm){
  var accountStoreMappings = asm;
})

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
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).
      The 2nd parameter is an [AccountStoreMapping](accountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

void;
If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, the instance of  [AccountStoreMapping](accountStoreMapping) will be provided to the `callback` as the callback's second parameter.

---

<a name="getDefaultGroupStore"></a>
### <span class="member">method</span> getDefaultGroupStore(*[options,]* callback)

Retrieves default `AccountStoreMapping` for storing `Groups` and provides it to the specified `callback`.
If default Group Store not set, `callback` will be called without parameters.

#### Usage


```javascript
application.getDefaultAccountStore({expand: 'accountStore'}, function(err, asm){
  var accountStoreMappings = asm;
})

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
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).
      The 2nd parameter is an [AccountStoreMapping](accountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

void;
If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, the instance of  [AccountStoreMapping](accountStoreMapping) will be provided to the `callback` as the callback's second parameter.


---

<a name="setDefaultAccountStore"></a>
### <span class="member">method</span> setDefaultAccountStore(store, callback)

Sets default `store` (`Group` or `Directory`) for storing `Application`'s `accounts`.
Returns a newly created `AccountStoreMapping` as a second callback parameter.


#### Usage


```javascript
application.setDefaultAccountStore(directory, function(err, asm){
  var accountStoreMapping = asm;
})

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
      <td>`store`</td>
      <td>`object`</td>
      <td>required</td>
      <td> If an `object`, an instance of `Group` or `Directory`.
        If a `string`, the `href` of a Directory or Group resource.
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).
      The 2nd parameter is an [AccountStoreMapping](accountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

void;
If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, the instance of  [AccountStoreMapping](accountStoreMapping) will be provided to the `callback` as the callback's second parameter.

---

<a name="setDefaultGroupStore"></a>
### <span class="member">method</span> setDefaultGroupStore(store, callback)

Sets default `store` (`Directory`) for storing `Application`'s `groups`.
Returns a newly created `AccountStoreMapping` as a second callback parameter.


#### Usage


```javascript
application.setDefaultGroupStore(directory, function(err, asm){
  var accountStoreMapping = asm;
})

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
      <td>`store`</td>
      <td>`object` or `string`</td>
      <td>required</td>
      <td>
        <p>If an `object`, an instance of `Directory`.  If a `string`, the `href` of a Directory resource.</p>
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).
      The 2nd parameter is an [AccountStoreMapping](accountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

void;
If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, the instance of  [AccountStoreMapping](accountStoreMapping) will be provided to the `callback` as the callback's second parameter.

---

<a name="createAccountStoreMapping"></a>
### <span class="member">method</span> createAccountStoreMapping(accountStoreMapping, callback)

Creates an instance of `AccountStoreMapping` from `accountStoreMapping` object and associate it with current application.
Returns a newly created `AccountStoreMapping` as a second callback parameter.


#### Usage


```javascript
var mapping = {
  application: {
    href: "https://api.stormpath.com/v1/applications/Uh8FzIouQ9C8EpcExAmPLe"
  }
  accountStore: {
    href: "https://api.stormpath.com/v1/directories/bckhcGMXQDujIXpExAmPLe"
  },
  isDefaultAccountStore: true,
  isDefaultGroupStore: true
};

application.createAccountStoreMapping(mapping, function(err, asm){
  var accountStoreMapping = asm;
})

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
      <td>`accountStoreMapping`</td>
      <td>`object`</td>
      <td>required</td>
      <td> The `AcountStoreMapping` object
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).
      The 2nd parameter is an [AccountStoreMapping](accountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

void;
If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, the instance of  [AccountStoreMapping](accountStoreMapping) will be provided to the `callback` as the callback's second parameter.

---

<a name="addAccountStore"></a>
### <span class="member">method</span> addAccountStore(store, callback)


Creates an instance of `AccountStoreMapping`, associate it with current `application`
and sets it's `accountStore` to provided `store`
Returns a newly created `AccountStoreMapping` as a second callback parameter.


#### Usage


```javascript
application.addAccountStore(directory, function(err, asm){
  var accountStoreMapping = asm;
})

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
      <td>`store`</td>
      <td>`object`</td>
      <td>required</td>
      <td> An instance of `Directory` or `Group`
      </td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).
      The 2nd parameter is an [AccountStoreMapping](accountStoreMapping) instance.</td>
    </tr>
  </tbody>
</table>

#### Returns

void;
If the request fails, the callback's first parameter (`err`) will report the failure.
If the request succeeds, the instance of  [AccountStoreMapping](accountStoreMapping) will be provided to the `callback` as the callback's second parameter.


[ID Site Feature Guide]: http://docs.stormpath.com/guides/using-id-site
