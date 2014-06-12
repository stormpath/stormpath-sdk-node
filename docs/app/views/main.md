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

Registering your Application with Stormpath is as easy as creating a new `Application` record:

```javascript
var app = {
  name: 'My Awesome Application!',
  description: 'No, Srsly. It\'s Awesome.'
};

client.createApplication(app, {createDirectory:true}, function onAppCreated(err, createdApp) {
  if (err) throw err;
  console.log(createdApp);
});
```

Did you see the optional options argument we specified: `{createDirectory:true}`?  This will automatically create a new
`Directory` to store all accounts and groups for that Application and assign it to the Application.

For more advanced use cases, you can omit the `options` argument and set up different account stores for your
Application later, for example:

```javascript
var app = {
  name: 'My Awesome Application!',
  description: 'No, Srsly. It\'s Awesome.'
};

client.createApplication(app, function onAppCreated(err, createdApp) {
  if (err) throw err;
  console.log(createdApp);
});
```

### Create an Application Account

Now that you've created an Application (and assigned it a Directory), you an add a user account!

```javascript
var account = {
  givenName: 'Jean-Luc',
  surname: 'Picard',
  username: 'jlpicard',
  email: 'jlpicard@starfleet.com',
  password: 'Changeme1!'
};

createdApp.createAccount(account, function onAccountCreated(err, createdAccount) {
  if (err) throw err;
  console.log(createdAccount);
});
```

### Update an Account

Change the fields you want and then call `save`:

```javascript
createdAccount.middleName = 'Make it so.';
createdAccount.save(function onSave(err, savedAccount) {
  if (err) throw err;
  console.log(savedAccount);
});
```

### Authenticate an Account

You can authenticate an account during login:

```javascript
var authcRequest = {
  username: 'jlpicard', //username can be an email address too
  password: 'Changeme1!'
};

createdApp.authenticateAccount(authcRequest, function onAuthcResult(err, result) {
  if (err) throw err;

  //if successful, you can obtain the account by calling result.getAccount:
  return result.getAccount(function(err2, account) { //this is cached and will execute immediately (no server request):
    if(err) throw err;
    console.log(account);
  });
};
```

### Send a Password Reset Email

If your end-user forgets their password, you can trigger the 'forgot password' reset workflow, and we'll send the email:

```javascript
var emailOrUsername = 'jlpicard'; //or we could have entered 'jlpicard@starfleet.com';

createdApp.sendPasswordResetEmail(emailOrUsername, function onEmailSent(err, token) {
  if (err) throw err;
  console.log(token);
});
```

### Create a Group

In Stormpath, the best way to think about roles and permissions is with [Groups](http://docs.stormpath.com/rest/product-guide/#groups).  Groups allow you to categorize Accounts and build complex permission systems.

Creating a new Group is easy:

```javascript
var group = {name: 'Administrators'}

createdApp.createGroup(group, onGroupCreation(err, createdGroup) {
  if (err) throw err;
  console.log(createdGroup);
});
```

### Add an Account to a Group:

You can do this easily two ways: by interacting with the account or by interacting with the group:

```javascript
//via the account
//groupOrGroupHref may be the actual group or the group's href:
account.addToGroup(groupOrGroupHref, onMembershipCreated(err, membership) {
  if (err) throw err;

  //membership is a GroupMembership resource that represents the pairing of the group to the account:
  console.log(membership);
});

//via the group:
group.addAccount(accountOrAccountHref, onMembershipCreated(err, membership) {
  if (err) throw err;

  //membership is a GroupMembership resource that represents the pairing of the group to the account:
  console.log(membership);
});
```

### Retrieve an Account's Groups

It is often useful to obtain an Account's Groups so you can perform access control - for example, see if an account is in the 'Administrators' group before allowing them to see certain data:

```javascript
account.getGroups(function onGroups(err, groups) {
  if (err) throw err;

  groups.each(function(err, group) {
    if (group.name === 'Administrators') {
      console.log('We have an administrator!');
    }
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
