'use strict';

var open = require('open');
var http = require('http');
var async = require('async');
var assert = require('assert');
var stormpath = require('../../lib');
var googleapis = require('googleapis');

var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

function e(err, message) {
  if (err) {
    console.error(message);
    throw err;
  }
}

var opts = {
  tenant: null,
  app: null,
  config: null,
  dir: null,
  provider: null,
  acc: null,
  providerData: null,
  oauth: {}
};

var server = null;

function w(cb, message, save) {
  return function (err, res) {
    e(err, message);
    if (save) {
      opts[save] = res;
    }

    console.log(message, res);
    cb(err, res);
  };
}

function r(exponent) {
  return Math.floor(Math.random() * Math.pow(10, exponent));
}

stormpath.loadApiKey(apiKeyFilePath, w(function (err, apiKey) {
  var client = new stormpath.Client({apiKey: apiKey});
  client.getCurrentTenant(w(onTenantReady, 'Current tenant: ', 'tenant'));
}, 'ApiKey loaded: '));

function getGoogleSettings(ignore, cb) {
  opts.config = {
    "providerId": "google",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  };
  assert(!!opts.config.clientId, 'Please provide GOOGLE_CLIENT_ID in env settings');
  assert(!!opts.config.clientSecret, 'Please provide GOOGLE_CLIENT_SECRET in env settings');
  assert(!!opts.config.redirectUri, 'Please provide GOOGLE_REDIRECT_URI in env settings, ' +
    'for this sample it should be "http://localhost:4444"');
  cb(null, {});
}

function createApplication(ignore, cb) {
  opts.tenant.createApplication(
    {name: 'Just Testing Google! Delete me.' + r(3)},
    w(cb, 'Application created: ', 'app'));
}

function createGoogleDirectory(ignore, cb) {
  var dir = {
    "name": "google-test-directory-DELETE-ME-" + r(3),
    "description": "A Google test directory",
    "provider": opts.config
  };

  opts.tenant.createDirectory(dir, w(cb, 'Directory created', 'dir'));
}

function createAccountStoreMapping(ignore, cb) {
  opts.app.addAccountStore(opts.dir, w(cb,
      'Create an Account Store Mapping between' +
      ' a Google Directory and your Application: ', 'accountStore'));
}

function getOauthToken(ignore, next) {
  var oauth2Client;

  async.series([
    function (cb) {
      googleapis
        .execute(function () {
          oauth2Client = new googleapis.OAuth2Client(opts.config.clientId,
            opts.config.clientSecret, opts.config.redirectUri);
          cb();
        });
    },
    function listen(cb) {
      server = http.createServer(function (req, res) {
        if (!/oauth2callback/.test(req.url)) {
          res.writeHead(200);
          return res.end();
        }

        res.writeHead(200,{"Content-Type":"text/html"});
        res.write("<html><head></head><body><script>window.close();</script></body></html>");
        res.end();

        var code = req.url.match(/code=([^&]*)/)[1];
        console.log('Google code: ', code);
        oauth2Client.getToken(code, function (err, tokens) {
          e(err);
          opts.oauth = tokens;
          console.log('Google tokens: ', tokens);
          next(err, {});
        });
      }).listen(4444, 'localhost', cb);
    },
    function (cb) {
      var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // will return a refresh token
        approval_prompt: 'force',
        scope: 'email profile'
      });

      open(url);
      cb();
    }
  ], function () {
  });
}

function createNewAccount(ignore, cb) {
  opts.app.getAccount({
    providerData: {
      providerId: 'google',
      accessToken: opts.oauth.access_token,
      refreshToken: opts.oauth.refresh_token
    }
  }, w(cb, 'Account: ', 'acc'));
}

var getOldAccount = createNewAccount;

function getDirectoryProvider(ignore, cb) {
  opts.dir.getProvider(w(cb, 'Provider: ', 'provider'));
}

function getAccountProviderData(ignore, cb) {
  opts.acc.account.getProviderData(w(cb, 'Provider data: ', 'providerData'));
}

function deleteApplication(ignore, cb) {
  opts.app.delete(w(cb, 'Application deleted!'));
}

function deleteDirectory(ignore, cb) {
  opts.dir.delete(w(cb, 'Directory deleted!'));
}

function onTenantReady(err, tenant) {
  async.waterfall([
    function (cb) {
      console.log('Smormpath google social login support sample');
      cb(null, {});
    },
    getGoogleSettings,
    createApplication,
    createGoogleDirectory,
    createAccountStoreMapping,

    getOauthToken,
    createNewAccount,

    getOldAccount,

    getDirectoryProvider,
    getAccountProviderData,

    deleteApplication,
    deleteDirectory
  ], function () {
    server.close();
    process.exit();
  });
}