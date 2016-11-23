'use strict';

// ==================================================
// This file is intended to reflect the Stormpath
// Node.js Quickstart documented here:
//
//     http://docs.stormpath.com/nodejs/api/
//
// Enjoy!
// ==================================================

var stormpath = require('stormpath');

//helper function to prevent any data collisions in the tenant while running the quickstart:
function unique(aString) {
  return aString + '-' + require('uuid').v4().toString();
}

//populated during the quickstart steps
var client, application, account, group = null;

var accountEmail = unique('jlpicard') + '@mailinator.com';

// ==================================================
// Step 1 - Create a client and wait for it to ready
// ==================================================
var client = new stormpath.Client();

client.on('ready', createApplication);

// ==================================================
// Step 2 - Register an application with Stormpath
// ==================================================
function createApplication() {

  var app = {
    name: unique('My Awesome Application'),
    description: ('No, Srsly. It\'s Awesome')
  };

  return client.createApplication(app, {createDirectory: true}, function(err, app) {
    if (err) throw err;
    application = app;
    console.log('Created application:');
    console.log(application);
    return createAccount(); //next quickstart step
  });
}

// ==================================================
// Step 3 - Create a new application account
// ==================================================
function createAccount() {

  var acct = {
    givenName: 'Jean-Luc',
    surname: 'Picard',
    username: unique('jlpicard'),
    email: accountEmail,
    password: 'Changeme1!'
  };

  return application.createAccount(acct, function(err, createdAccount) {
    if (err) throw err;
    account = createdAccount;
    console.log('Created account:');
    console.log(account);
    return updateAccount(); //next quickstart step
  });
}

// ==================================================
// Step 3 - Update an account
// ==================================================
function updateAccount() {

  account.middleName = 'Make it so.';

  return account.save(function(err, savedAccount) {
    if (err) throw err;
    account = savedAccount;
    console.log('Updated account:');
    console.log(account);
    return authenticateAccount(); //next quickstart step
  });

}

// ==================================================
// Step 4 - Authenticate an account
// ==================================================
function authenticateAccount() {

  var authcRequest = {
    username: accountEmail, //we could've entered the username instead
    password: 'Changeme1!'
  };

  return application.authenticateAccount(authcRequest, function(err, result) {
    if (err) throw err;

    return result.getAccount(function(err2, theAccount) { //this is cached and will execute immediately (no server request):
      if(err2) throw err2;

      account = theAccount;

      console.log('Authenticated account:');
      console.log(account);

      //authentication was successful, so we ordinarily have no need to send a
      //password reset email right now, but hey - this is a quickstart and we're
      //trying to show stuff!  So kick off the password reset workflow just for fun:
      return sendPasswordResetEmail(); //next quickstart step
    });
  });
}

// ==================================================
// Step 5 - Send the account a password reset email
// ==================================================
function sendPasswordResetEmail() {

  return application.sendPasswordResetEmail(accountEmail, function(err, token) {
    if (err) throw err;

    console.log("Sent email that included a link with password reset token: " + token.toString());
    console.log("If you like, go to mailinator.com and use this email address to view the email: " + accountEmail);

    //ok, moving on with the quickstart:
    return createGroup();
  });
}

// ==================================================
// Step 6 - Create a group
// ==================================================
function createGroup() {

  var aGroup = {
    name: unique('Administrators')
  };

  return application.createGroup(aGroup, function(err, createdGroup) {
    if (err) throw err;
    group = createdGroup;

    return addAccountToGroup(); //next quickstart step
  });
}

// ==================================================
// Step 7 - Add an Account to a Group
// ==================================================
function addAccountToGroup() {

  return account.addToGroup(group, function(err, membership) {
    if (err) throw err;
    console.log(membership);

    return retrieveAccountGroups(); //next quickstart step
  });

}

// ==================================================
// Step 8 - Retrieve an Account's Groups
// ==================================================
function retrieveAccountGroups() {
  account.getGroups(function(err, groups) {
    groups.each(function(err, group) {
      console.log(group);
    })
  });

  //finish quickstart:
  cleanup();
}

// ==================================================
// End of quickstart - cleanup quickstart data
// ==================================================
//deletes the objects we created during the quickstart so we don't pollute the tenant
function cleanup() {

  var ds = application.dataStore;

  //delete the application's directory.  This will auto-delete any contained accounts and groups:
  ds.getResource(application.defaultAccountStoreMapping.href, function(err, mapping) {
    if (err) throw err;

    console.log('Retrieved application accountStoreMapping for deletion:');
    console.log(mapping);

    ds.deleteResource(mapping.accountStore, function(err) {
      if(err) throw err;

      console.log('Deleted application directory.');

      application.delete(function(err) {
        if (err) throw err;
        console.log('Deleted application.');
      });
    });
  });
}
