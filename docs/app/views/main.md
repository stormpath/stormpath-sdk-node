# Stormpath Node.js API

This is the API documentation of the Stormpath SDK Node.js module/package.

[Stormpath](https://www.stormpath.com) is a cloud-hosted user management service that automates best-in-class user security for your applications so you can ship your application faster and more securely.

It provides applications safe user account and group/role management, authentication, best-practices password security, access control, automated security workflows like user registration, account email verification and password resets, social login with services like Facebook and Google Apps, secure sync for on-premise LDAP and Active Directory accounts, custom user and group data, and much more.

## Install

    npm install stormpath

## Quickstart

This quickstart assumes you have [signed up for Stormpath](http://docs.stormpath.com/rest/quickstart/#sign-up-for-stormpath), [downloaded your API Key file](http://docs.stormpath.com/rest/quickstart/#get-an-api-key), and saved it to `$HOME/.stormpath/apiKey.properties`

### Create a Stormpath Client

The Stormpath `Client` object is your starting point for all interactions with the Stormpath REST API.  You can create (and customize) the Stormpath client in a number of ways, but at a bare minimum you need to specify your Stormpath API Key.

You can do this easily in one of two ways:

* Reference your downloaded `apiKey.properties` file:

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

### List Your Applications and Directories

```javascript
client.getApplications(function(err, apps) {
  if (err) throw err;

  apps.each(function(err, app, offset) { //offset is an optional argument
    console.log(offset + ": " + app;
  });
});

//showing optional options argument (the callback function is always the last arg):
client.getDirectories({expand: 'groups'}, function(err, dirs) {
  if (err) throw err;

  dirs.each(function(err, dir) {
    console.log(dir);
  });
});
```

### Retrieve a specific Application, Directory, Account, Group or GroupMembership:

If you know a resource's `href`, you can retrieve it directly:

```javascript
client.getApplication('https://api.stormpath.com/v1/applications/LYENsku3RYatufdNHL0d2', callback);
client.getDirectory('https://api.stormpath.com/v1/directories/LYN1zLGlGV0qxVu7Cwg4C', callback);
client.getAccount('https://api.stormpath.com/v1/groups/1NB5Ymg9Gh9WATB54MoIai', callback);
client.getGroup('https://api.stormpath.com/v1/groups/2gdhVFXQMTpoUHAHzCXbn4', callback);
client.getGroupMembership('https://api.stormpath.com/v1/groupMemberships/2ObFs1E4AB0LlqxxLtzlgi', callback);
```

`callback` accepts two arguments: an `Error` object, followed by the resource returned, for example:

```javascript
client.getApplication(appHref, function (err, application) {...});
```

### Create an Application

Registering your Application with Stormpath is as easy as creating a new `Application` record:

```javascript
var app = {
  name: 'My Awesome Application!',
  description: 'No, Srsly. It's Awesome.'
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
  description: 'No, Srsly. It's Awesome.'
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
  password 'Changeme1!'
};

createdApp.authenticateAccount(authcRequest, function onAuthcResult(err, result) {
  if (err) throw err;

  //if successful, the result will have an account field of the successfully authenticated account:
  console.log(result.account);
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
