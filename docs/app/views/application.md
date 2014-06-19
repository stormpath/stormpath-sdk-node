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
  password 'RawPassw0rd!'
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
      <td>Object with two name/value pairs: `username` and `password`.  `username` can be either a username or email address. `password` is the _raw_ password submitted directly by your application user.  Stormpath hashes and encrypts this value securely automatically - you don't have to do anything special before submitting to Stormpath.</td>
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
    scopeFactory: function(account,requestedScope){
      // determine what scope to give, then return
      return 'granted-scope';
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
            `scopeFactory` - OPTIONAL - A function which will be called with `(account,requestedScope)` where the account is the
            successfully authenticated account and `requstedScope` is the string that was given by the user in the request.  You must return
            the scope(s) you wish to grant, as a single string or an array of strings.
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
### <span class="member">method</span> getApiKey(apiKeyId, callback)

Retrieves an [ApiKey](api) with an expanded `account` object, if there is an account wit the given
Api Key Id and the account is accessible from this application through an
[account store mapping](accountStoreMapping).

#### Usage

````javascript
application.getApiKey(function(err,apiKey){
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

var sptoken = request.query.sptoken;

application.verifyPasswordResetToken(sptoken, function(err, associatedAccount) {

  //if the associated account was retrieved, you need to collect the new password
  //from the end-user and update their account.

  //using your web framework of choice (express.js?), collect the new password and then change the
  //associated account's password later:

  associatedAccount.password = newRawPassword;
  associatedAccount.save(function(err2, acct){});
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
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is the account associated with the reset token.  You can collect a new password for this account, set the account's password, and then [save](account#save) the account.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; If an account with the specified password reset token is not found, the callback's first parameter (`err`) will report the failure.  If the account is found, it will be provided to the `callback` as the callback's second parameter.

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(providerData, *[options,]* callback)

Retrieves or creates an `Account`, if `Application` have an associated `Account Store` with `Provider`
 and provides it to the specified `callback` in special format:

```javascript
{
  account: Account,
  created: Boolean
}
```

If `account` was created, `created` will be `true`, if `account` was created earlier, `created` will be `false`.

#### Usage

Google (you can view full usage sample in /samples/google_integration folder):

```javascript
// required scopes: 'email profile'
var req = {
  providerData: {
    providerId: 'google',
    accessToken: oauth.access_token
    //code: oauth.authorization_code
  };

application.getAccount(req, function(err, resp) {

  if(resp.created){
    console.log('Just created a new user');
  }

  console.log(resp.account);
});
```

Facebook (you can view full usage sample in /samples/facebook_integration folder):

```javascript
// required scope: 'email'
var req = {
  providerData: {
    providerId: 'facebook',
    accessToken: oauth.access_token
  };

application.getAccount(req, function(err, resp) {

  if(resp.created){
    console.log('Just created a new user');
  }

  console.log(resp.account);
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
      <td>providerData</td>
      <td>`object`</td>
      <td>required</td>
      <td>An request object with `ProviderData` inside,
        take a look on [documentation](http://docs.stormpath.com/rest/product-guide/#accessing-accounts-with-google-authorization-codes-or-an-access-tokens) for details </td>
    </tr>
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

void; the retrieved `Account` resource will be provided to the `callback`
 as the callback's second parameter, in special format.

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
      <td> An instance of `Group` or `Directory`
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
      <td>`object`</td>
      <td>required</td>
      <td> An instance of `Directory`
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
