## Application

An `Application` in Stormpath represents any real world piece of software that communicates with Stormpath to offload its user management and authentication needs. The application can be anything that can make a REST API call – a web application that you are writing, a web server like Apache or Nginx, a Linux operating system, etc – basically anything that a user can login to. A [tenant](tenant) administrator can register one or more applications with Stormpath.

You control who may login to an application by assigning (or ‘mapping’) one or more [Directories](directory) or [Groups](group) (generically both called _account stores_) to an application. The Accounts in these associated directories or groups (again, _account stores_) collectively form the application’s user base. These accounts are considered the application’s users and they can login to the application. Therefore, you can control user population that may login to an application by managing which account stores are assigned to the application.

Even the Stormpath Admin Console and API is represented as an `Application` (named 'Stormpath'), so you can control who has administrative access to your Stormpath tenant by managing the Stormpath application’s associated account stores.

**Since**: 0.1

---

<a name="authenticateAccount"></a>
### <span class="member">method</span> authenticateAccount(authenticationRequest, callback)

Performs an authentication attempt for an application account via the supplied `authenticationRequest` argument, providing the authentication result to the specified `callback`.

#### Usage

Authenticate your application user accounts with a simple username/password pair:

```javascript
var authcRequest = {
  username: 'jlpicard', //username can be an email address too
  password 'RawPassw0rd!'
};

application.authenticateAccount(authcRequest, function onAuthcResult(err, result) {
  if (err) throw err;

  //if successful, the result will have an account field with the successfully authenticated account:
  console.log(result.account);
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
      <td>The callback to execute upon server response. The 1st parameter is an [error](resourceError).  The 2nd parameter is an `object` result that contains the successfully authenticated account available via the `account` field, for example, `result.account`.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; If the authentication fails, the callback's first parameter (`err`) will report the failure.  If the authentication succeeds, the success result will will be provided to the `callback` as the callback's second parameter.  The successfully authenticated account may be obtained via the result object's `account` field, for example `result.account`.

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
  if (err) throw err;
  console.log(createdAccount);
});
```

You can also specify options to control creation behavior and things like reference expansion:

```javascript
...

var options = {registrationWorkflowEnabled: false, expand: 'directory'};

application.createAccount(account, options, function onAccountCreated(err, createdAccount) {
  if (err) throw err;
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
  if (err) throw err;
  console.log(createdGroup);
});
```

You can also specify options to control things like reference expansion:

```javascript
application.createAccount(group, {expand:'directory'}, function onAccountCreated(err, createdAccount) {
  if (err) throw err;
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

<a name="getTenant"></a>
### <span class="member">method</span> getTenant(*[options,]* callback)

Retrieves the application's owning [Tenant](tenant) and provides it to the specified `callback`.

#### Usage

```javascript
application.getTenant(function(err, tenant) {
    if (err) throw err;
    console.log(tenant);
});
```
You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:
```javascript
application.getTenant({expand:'directories'}, function(err, tenant) {
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

<a name="sendPasswordResetEmail"></a>
### <span class="member">method</span> sendPasswordResetEmail(email, callback)

Triggers the [password reset workflow](http://docs.stormpath.com/rest/product-guide/#application-password-reset) for an application account matching the specified `email` (and of course, sends an email to that account's email address).  This will result in a newly created `PasswordResetToken` resource which will be provided to the specified `callback`.  The corresponding account is accessible as a field on the provided `PasswordResetToken` object.

#### Usage

```javascript
application.sendPasswordResetEmail(email, function(err, passwordResetToken) {
  if (err) throw err;

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
  if (err) throw err;

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