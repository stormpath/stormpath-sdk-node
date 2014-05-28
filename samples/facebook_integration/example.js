'use strict';

var open = require('open');
var http = require('http');
var async = require('async');
var assert = require('assert');
var request = require('request');
var stormpath = require('../../lib');
var querystring = require('querystring');

var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

function e(err, message){
  if(err){
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

function w(cb, message, save){
  return function(err, res){
    e(err, message);
    if (save){
      opts[save] = res;
    }

    console.log(message, res);
    cb(err, res);
  };
}

function r(exponent){
  return Math.floor(Math.random() * Math.pow(10, exponent));
}

stormpath.loadApiKey(apiKeyFilePath, w(function (err, apiKey) {
  var client = new stormpath.Client({apiKey: apiKey});
  client.getCurrentTenant(w(onTenantReady, 'Current tenant: ', 'tenant'));
}, 'ApiKey loaded: '));

function getFacebookSettings(ignore, cb){
  opts.config = {
    providerId: "facebook",
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI
  };
  assert(!!opts.config.clientId, 'Please provide FACEBOOK_CLIENT_ID in env settings');
  assert(!!opts.config.clientSecret, 'Please provide FACEBOOK_CLIENT_SECRET in env settings');
  assert(!!opts.config.redirectUri, 'Please provide FACEBOOK_REDIRECT_URI in env settings, ' +
    'for this sample it should be "http://localhost:4444"');
  cb(null, {});
}

function createApplication(ignore, cb){
  opts.tenant.createApplication(
    {name: 'Just Testing Facebook! Delete me.' + r(3)},
    w(cb, 'Application created: ', 'app'));
}

function createFacebookDirectory(ignore, cb){
  var dir = {
    "name" : "facebook-test-directory-DELETE-ME-" + r(3),
    "description" : "A Facebook test directory",
    "provider": opts.config
  };

  opts.tenant.createDirectory(dir, w(cb, 'Directory created', 'dir'));
}

function createAccountStoreMapping(ignore, cb){
  opts.app.addAccountStore(opts.dir, w(cb,
    'Create an Account Store Mapping between' +
      ' a Facebook Directory and your Application: ', 'accountStore'));
}

function getOauthToken(ignore, next){
  async.series([
    function listen(cb){
      server = http.createServer(function(req, res){
        if (!/oauth2callback/.test(req.url)){
          res.writeHead(200);
          return res.end();
        }

        res.writeHead(200,{"Content-Type":"text/html"});
        res.write("<html><head></head><body><script>window.close();</script></body></html>");
        res.end();

        var tokens = querystring.parse(req.url.substr(req.url.indexOf('?')+1));
        console.log('Facebook code: ', tokens);
        if (tokens.code){
          var options = {
            client_id: opts.config.clientId,
            redirect_uri: opts.config.redirectUri,
            client_secret: opts.config.clientSecret,
            code: tokens.code
          };
          var url = 'https://graph.facebook.com/oauth/access_token' + '?' + querystring.stringify(options);
          request.get(url, function(err, resp){
            tokens = querystring.parse(resp.body);
            console.log('Facebook tokens: ', tokens);
            opts.oauth = tokens;
            next(null, {});
          });
        }
      }).listen(4444, 'localhost', cb);
    },
    function(cb){
      var options = {
        client_id: opts.config.clientId,
        redirect_uri: opts.config.redirectUri,
        response_type: 'code',
        scope: 'email'
      };
      var url = 'https://www.facebook.com/dialog/oauth' + '?' + querystring.stringify(options);

      open(url);
      cb();
    }
  ], function(){});
}

function createNewAccount(ignore, cb){
  opts.app.getAccount({
    providerData: {
      providerId: 'facebook',
      accessToken: opts.oauth.access_token,
      refreshToken: opts.oauth.refresh_token
    }
  }, w(cb, 'Account: ', 'acc'));
}

var getOldAccount = createNewAccount;

function getDirectoryProvider(ignore, cb){
  opts.dir.getProvider(w(cb, 'Provider: ', 'provider'));
}

function getAccountProviderData(ignore, cb){
  opts.acc.account.getProviderData(w(cb, 'Provider data: ', 'providerData'));
}

function deleteApplication(ignore, cb){
  opts.app.delete(w(cb, 'Application deleted!'));
}

function deleteDirectory(ignore, cb){
  opts.dir.delete(w(cb, 'Directory deleted!'));
}

function onTenantReady(err, tenant){
  async.waterfall([
    function(cb){
      console.log('Smormpath facebook social login support sample');
      cb(null, {});
    },
    getFacebookSettings,
    createApplication,
    createFacebookDirectory,
    createAccountStoreMapping,

    getOauthToken,
    createNewAccount,

//    getOldAccount,

    getDirectoryProvider,
    getAccountProviderData,

    deleteApplication,
    deleteDirectory
  ], function(){
    server.close();
    process.exit();
  } );
}