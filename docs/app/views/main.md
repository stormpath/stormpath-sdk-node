# Stormpath SDK for Node.js API Documentation

This is the API documentation of the Stormpath SDK Node.js module/package.

[Stormpath](https://www.stormpath.com) is a cloud-hosted user management service that automates best-in-class user security for your applications so you can ship your application faster and more securely.

It provides applications safe user account and group/role management, authentication, best-practices password security, access control, automated security workflows like user registration, account email verification and password resets, social login with services like Facebook and Google Apps, secure sync for on-premise LDAP and Active Directory accounts, custom user and group data, and much more.

## Install

    npm install stormpath

## Quickstart

This quickstart assumes you have [signed up for Stormpath](http://docs.stormpath.com/rest/quickstart/#sign-up-for-stormpath], and you [downloaded your API Key file](http://docs.stormpath.com/rest/quickstart/#get-an-api-key) and saved it to `$HOME/.stormpath/apiKey.properties`.

### Create a Stormpath Client

The Stormpath `Client` object is your starting point for all interactions with the Stormpath REST API.  You can create (and customize) the Stormpath client in a number of ways, but at a bare minimum you need to specify your Stormpath API Key.

You can do this easily in one of two ways:

1. Reference your downloaded `apiKey.properties` file:

        var stormpath = require('stormpath');

        //Reference apiKey.properties in the process user's home dir.  Works on both Windows and *nix systems:
        var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
        var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

        var client = null; //available after the ApiKey file is asynchronously loaded from disk

        stormpath.loadApiKey(apiKeyFilePath, function apiKeyFileLoaded(err, apiKey) {
          if (err) throw err;

          client = new stormpath.Client({apiKey: apiKey});
        });

2. Create an ApiKey object manually

        var stormpath = require('stormpath');

        //In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
        var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

        var client = new stormpath.Client({apiKey: apiKey});








