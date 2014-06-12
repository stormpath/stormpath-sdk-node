# Stormpath Node.js API

This is the Stormpath Node.js module's API documentation.

[Stormpath][] is a cloud-hosted user management service that automates
best-in-class user security for your applications so you can ship your
application faster and more securely.

This module provides abstractions around applications, safe user account and
group / role management, authentication, best-practices password security,
access control, social login with services like Facebook and Google, automated
security workflows (*user registration, account email verification, password
reset*), secure sync for on-premise LDAP and Active Directory accounts, custom
user and group data, and much more.


## <a name="install"></a>Install

Installing the [stormpath module][] is simple via [npm][].  Just run:

```console
$ npm install stormpath
```

And the module will be installed and ready for use!


## <a name="quickstart"></a>Quickstart

This quickstart assumes you have [signed up for Stormpath][],
[downloaded your API key file][], and saved it to
`~/.stormpath/apiKey.properties`.


### Create a Stormpath Client

The Stormpath `Client` object is your starting point for all interactions with
the Stormpath REST API.  You can create (*and customize*) the Stormpath Client
in a number of ways, but at a bare minimum you need to specify your Stormpath
API credentials.

You can do this easily in one of two ways:

* Reference your downloaded `apiKey.properties` file:

  ```javascript
  var stormpath = require('stormpath');

  // Find the user's home directory (works on both Windows and *nix):
  var home = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
  var apiKeyFilePath = home + '/.stormpath/apiKey.properties';

  // Will be available after the properties file is asynchronously loaded from
  // disk:
  var client; 

  stormpath.loadApiKey(apiKeyFilePath, function(err, apiKey) {
    if (err) throw err;
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


### List Your Applications and Directories

In order to get a list of all your Stormpath [Applications][] and
[Directories][], you can use the following code snippet:

```javascript
client.getApplications(function(err, apps) {
  if (err) throw err;

  apps.each(function(app, callback) {
    console.log(app);
    callback();
  });
});


client.getDirectories({expand: 'groups'}, function(err, dirs) {
  if (err) throw err;

  dirs.each(function(dir, callback) {
    console.log(dir);
    callback();
  });
});
```

**NOTE**: You can *expand* any linked properties available when listing
Stormpath resources.  This is a great way to reduce the amount of network calls
you make to Stormpath when developing fast applications.


### Retrieve a Specific Resource

If you know a resource's `href`, you can retrieve it directly:

```javascript
client.getApplication('https://api.stormpath.com/v1/applications/xxx', callback);
client.getDirectory('https://api.stormpath.com/v1/directories/xxx', callback);
client.getAccount('https://api.stormpath.com/v1/accounts/xxx', callback);
client.getGroup('https://api.stormpath.com/v1/groups/xxx', callback);
client.getGroupMembership('https://api.stormpath.com/v1/groupMemberships/xxx', callback);
```

In each of the above cases, `callback` should be a function which accepts two
arguments:

- An `Error` object.
- The resource object.

For example:

```javascript
var appHref = 'https://api.stormpath.com/v1/applications/xxx';

client.getApplication(appHref, function(err, app) {
  if (err) throw err;

  console.log(app);
});
```


### Create an Application

Creating a Stormpath Application is simple:

```javascript
var app = {
  name: 'My Awesome Application!',
  description: "No, Srsly. It's Awesome."
};

client.createApplication(app, {createDirectory: true}, function(err, newApp) {
  if (err) throw err;

  console.log(newApp);
});
```

**NOTE**: The optional argument we specified, `{createDirectory: true}`, will
automatically create a new Directory to hold all Accounts and Groups for that
Application automatically.  Nice, right?

For more advanced use cases, you can omit the `options` argument and set up
different account stores for your Application later.  For example:

```javascript
var app = {
  name: 'Cooler App',
  description: 'The coolest app ever made.'
};

client.createApplication(app, function(err, newApp) {
  if (err) throw err;

  console.log(newApp);
});
```


### Create an Account

Now that you've created an Application (*and assigned it a Directory*), you can
create a user account!

```javascript
var account = {
  givenName: 'Jean-Luc',
  surname: 'Picard',
  username: 'jlpicard',
  email: 'jlpicard@starfleet.com',
  password: 'Changeme1!'
};

newApp.createAccount(account, function(err, newAccount) {
  if (err) throw err;

  console.log(newAccount);
});
```


### Update an Account

You can update an Account object by modifying the fields you want to change,
then calling the `save` method:

```javascript
newAccount.middleName = 'Make it so.';
newAccount.save(function(err, updatedAccount) {
  if (err) throw err;

  console.log(updatedAccount);
});
```


### Authenticate an Account

You can authenticate an Account (*retrieve an Account object given a username
(or email address) and password*) using the `authenticateAccount` method of and
Application or Directory:

```javascript
// NOTE: The username field could also be an email address.
var credentials = {
  username: 'jlpicard',
  password: 'Changeme1!'
};

newApp.authenticateAccount(credentials, function(err, result) {
  if (err) throw err;

  // If successful, you can obtain the Account by doing the following:
  result.getAccount(function(err, account) {
    if (err) throw err;
    console.log(account);
  });
});
```

**NOTE**: The call to `result.getAccount` is cached, and will execute
immediately (*no HTTP request necessary*).


### Send a Password Reset Email

If one of your end-users forgets their password, you can trigger the
*"Forgot Password"* reset workflow, and we'll send the user an email:

```javascript
var emailOrUsername = 'jlpicard';

app.sendPasswordResetEmail(emailOrUsername, function(err, token) {
  if (err) throw err;

  console.log(token);
});
```

For more information on resetting a user's password, you might want to read
about Stormpath's [Password Reset Workflow][]  (*and yes, you can customize the
password reset emails!*).


### Create a Group

In Stormpath, the best way to think about roles and permissions is via
[Groups][].  Groups allow you to categorize Accounts and build complex
permission systems.

Creating a new Group is easy:

```javascript
var group = {name: 'Administrators'};

app.createGroup(group, function(err, newGroup) {
  if (err) throw err;

  console.log(newGroup);
});
```


### Assign an Account to a Group

You can do easily assign a Group to an Account in two ways: by interacting with
the Account, or by interacting with the Group:

```javascript
account.addToGroup(groupOrGroupHref, function(err, membership) {
  if (err) throw err;

  console.log(membership);
});

group.addAccount(accountOrAccountHref, function(err, membership) {
  if (err) throw err;

  console.log(membership);
});
```

**NOTE**: In both examples above, `membership` is a [GroupMembership][] resource
that represents the pairing of the Group to the Account -- in most cases, you
don't need to worry about using this directly.


### Retrieve an Account's Groups

It is often useful to obtain an Account's Groups so you can perform access
control.  For example, you might want to see if an Account is in the
'Administrators' Group before allowing them to see certain data.

You can do this by iterating over an Account's groups like so:

```javascript
account.getGroups(function(err, groups) {
  if (err) throw err;

  groups.each(function(group, callback) {
    if (group.name === 'Administrators') {
      console.log('We have an administrator!');
    }

    callback();
  }, function(err) {
    if (err) throw err;
  });
});
```


  [Stormpath]: https://stormpath.com/ "Stormpath"
  [stormpath module]: https://www.npmjs.org/package/stormpath "Stormpath on npm"
  [npm]: https://www.npmjs.org/ "npm"
  [signed up for stormpath]: http://docs.stormpath.com/rest/quickstart/#sign-up-for-stormpath "Sign Up For Stormpath"
  [downloaded your API key file]: http://docs.stormpath.com/rest/quickstart/#get-an-api-key "Get a Stormpath API Key"
  [Applications]: https://api.stormpath.com/v#!applications "Your Stormpath Applications"
  [Directories]: https://api.stormpath.com/v#!directories "Your Stormpath Directories"
  [Password Reset Workflow]: http://docs.stormpath.com/rest/product-guide/#reset-an-accounts-password "Stormpath Docs - Reset an Account's Password"
  [Groups]: http://docs.stormpath.com/rest/product-guide/#groups "Stormpath Groups"
  [GroupMembership]: http://docs.stormpath.com/rest/product-guide/#group-memberships "Stormpath GroupMembership"
