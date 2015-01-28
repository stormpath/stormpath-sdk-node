'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');
var AuthRequestParser = require('../authc/AuthRequestParser');
var ApiKeyEncryptedOptions = require('../authc/ApiKeyEncryptedOptions');
var BasicApiAuthenticator = require('../authc/BasicApiAuthenticator');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var OAuthBasicExchangeAuthenticator = require('../authc/OAuthBasicExchangeAuthenticator');
var OauthAccessTokenAuthenticator = require('../authc/OauthAccessTokenAuthenticator');
var AuthenticationResult = require('./AuthenticationResult');
var Account = require('./Account');
var errorMessages = require('../error/messages');

var uuid = require('node-uuid');
var url = require('url');
var jwt = require('jwt-simple');

function Application() {
  Application.super_.apply(this, arguments);
}
utils.inherits(Application, InstanceResource);

Application.prototype.createIdSiteUrl = function createIdSiteUrl(_options) {
  var self = this;
  var options = typeof _options === "object" ? _options : {};
  var p = url.parse(self.href);
  var base = p.protocol + '//' + p.host;
  var apiKey = self.dataStore.requestExecutor.options.apiKey;
  var nonce = uuid();
  var state = options.state || '';

  if(!options.callbackUri){
    throw new Error(errorMessages.ID_SITE_INVALID_CB_URI);
  }

  var token = jwt.encode({
    jti: nonce,
    iat: new Date().getTime()/1000,
    iss: apiKey.id,
    sub: self.href,
    state: state,
    path: options.path || '/',
    cb_uri: options.callbackUri
  },apiKey.secret,'HS256');

  var redirectUrl = base + '/sso'+(options.logout?'/logout':'')+'?jwtRequest=' + token;

  return redirectUrl;
};

Application.prototype._decodeJwt = function _decodeJwt(str,secret){
  var jwtObject;
  try{
    jwtObject = jwt.decode(str, secret);
    return jwtObject;
  }
  catch(e){
    return e;
  }
};

Application.prototype.handleIdSiteCallback = function handleIdSiteCallback(responseUri,callback) {
  var self = this;

  if(typeof responseUri !== 'string'){
    throw new Error('handleIdSiteCallback must be called with an uri string');
  }

  var cb = typeof callback === 'function' ? callback : utils.noop;

  var params = (url.parse(responseUri,true).query) || {};
  var token = params.jwtResponse || '';
  var secret = self.dataStore.requestExecutor.options.apiKey.secret;
  var apiKeyId = self.dataStore.requestExecutor.options.apiKey.id;

  var jwtObjectDecodedValue = self._decodeJwt(token,secret);

  if(jwtObjectDecodedValue instanceof Error){
    return cb(jwtObjectDecodedValue);
  }

  if(jwtObjectDecodedValue.aud !== apiKeyId){
    return cb(new Error(errorMessages.ID_SITE_JWT_INVALID_AUD));
  }

  if(!utils.isNumber(jwtObjectDecodedValue.exp) || (utils.nowEpochSeconds() > jwtObjectDecodedValue.exp)){
    return cb(new Error(errorMessages.ID_SITE_JWT_HAS_EXPIRED));
  }

  var nonce = jwtObjectDecodedValue.irt;
  var accountHref = jwtObjectDecodedValue.sub;

  self.dataStore.nonceStore.getNonce(nonce,function(err,value){
    if(err){
      cb(err);
    }else if(value){
      cb(new Error(errorMessages.ID_SITE_JWT_ALREADY_USED));
    }else{
      self.dataStore.nonceStore.putNonce(nonce,utils.noop);

      self.dataStore.getResource(accountHref,Account,function(err,account){
        if(err){
          cb(err);
        }else{
          cb(null,{
            account: account,
            state: jwtObjectDecodedValue.state,
            isNew: jwtObjectDecodedValue.isNewSub,
            status: jwtObjectDecodedValue.status
          });
        }
      });
    }
  });
};

Application.prototype.authenticateAccount = function authenticateApplicationAccount(authcRequest, callback) {
  var _this = this,
    username = authcRequest.username,
    password = authcRequest.password,
    type = authcRequest.type || 'basic';
  var accountStore = ('string' === typeof authcRequest.accountStore) ?
    {href: authcRequest.accountStore} :
    authcRequest.accountStore;

  var loginAttempt = {
    type: type,
    value: utils.base64.encode(username + ":" + password)
  };

  if (authcRequest.accountStore){
    loginAttempt.accountStore = accountStore;
  }

  _this.dataStore.createResource(
    _this.loginAttempts.href,
    {expand: 'account'},
    loginAttempt,
    AuthenticationResult,
    function(err,authenticationResult){
      if(err){
        callback(err);
      }
      else{
        authenticationResult.application = _this;
        callback(null,authenticationResult);
      }
  });
};

Application.prototype.sendPasswordResetEmail = function sendApplicationPasswordResetEmail(emailOrUsername, callback) {
  var self = this;
  return self.dataStore.createResource(self.passwordResetTokens.href, {email: emailOrUsername}, callback);
};

Application.prototype.resendVerificationEmail = function resendVerificationEmail(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;
  return self.dataStore.createResource(self.verificationEmails.href, options, callback);
};

Application.prototype.verifyPasswordResetToken = function verifyApplicationPasswordResetToken(token, callback) {
  var self = this;
  var href = self.passwordResetTokens.href + "/" + token;
  return self.dataStore.getResource(href, callback);
};

Application.prototype.resetPassword = function resetApplicationPassword(token, password, callback) {
  var self = this;
  var href = self.passwordResetTokens.href + "/" + token;
  return self.dataStore.createResource(href, {expand: 'account'}, { password: password }, callback);
};

Application.prototype.getAccounts = function getApplicationAccounts(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accounts.href, options, require('./Account'), callback);
};

Application.prototype.getAccount = function getAccount(/* providerData, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var providerData = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  var w = function getAccountCallbackWrapper(callback){
    return function(err, account){
      if(err){
        callback(err);
      }else{
        var isNew = account._isNew;
        delete account._isNew;
        callback(err, {
          account: account,
          created: isNew
        });
      }
    };
  };

  return self.dataStore.createResource(self.accounts.href, options, providerData, require('./Account'), w(callback));
};

Application.prototype.createAccount = function createApplicationAccount(/* account, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var account = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.createResource(self.accounts.href, options, account, require('./Account'), callback);
};

Application.prototype.getGroups = function getApplicationGroups(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.groups.href, options, require('./Group'), callback);
};

Application.prototype.createGroup = function createApplicationGroup(/* group, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var group = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.createResource(self.groups.href, options, group, require('./Group'), callback);
};

Application.prototype.getTenant = function getApplicationTenant(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.tenant.href, options, require('./Tenant'), callback);
};

Application.prototype.getApiKey = function getApiKey(apiKeyId, options, callback) {
  var self = this;
  var argCount = Array.prototype.slice.call(arguments).length;
  var cb = argCount === 3 ? callback : options;
  var opts = argCount === 3 ? options : {};

  opts.id = apiKeyId;

  return self.dataStore.getResource(self.apiKeys.href, new ApiKeyEncryptedOptions(opts), require('./ApiKey'), function(err,result){
    if(err){
      cb(err);
    }else if(result instanceof require('./ApiKey')){
      // this happens if we found it in the cache.  manually 'expand' the account
      self.dataStore.getResource(result.account.href,function(err,account){
        if(err){ cb(err); }else{
          result.account = account;
          cb(null,result);
        }
      });

    }else if(result && result.items && result.items.length === 1 ){
      cb(null,result.items[0]);
    }else{
      var error = new Error('ApiKey not found');
      error.status = 404;
      cb(error);
    }
  });
};

Application.prototype.authenticateApiRequest = function authenticateApiRequest(options,callback) {
  var self = this;

  if(typeof options!=='object'){
    throw new ApiAuthRequestError('options must be an object');
  }

  if(typeof options.request!=='object'){
    throw new ApiAuthRequestError('options.request must be an object');
  }

  if(options.ttl && (typeof options.ttl!=='number')){
    throw new ApiAuthRequestError('ttl must be a number');
  }
  var validAccessTokenRequestLocations = ['header','body','url'];
  var defaultAccessTokenRequestLocations = ['header','body'];
  var locationsToSearch;

  if(Array.isArray(options.locations)){
    locationsToSearch = options.locations.filter(function(location){
      return validAccessTokenRequestLocations.indexOf(location) > -1;
    });
  }else{
    locationsToSearch = defaultAccessTokenRequestLocations;
  }

  var ttl = options.ttl;

  var application = self;

  var req = options.request;

  var scopeFactory = typeof options.scopeFactory === 'function' ? options.scopeFactory : null;

  var parser = new AuthRequestParser(req,locationsToSearch);

  var authHeaderValue = parser.authorizationValue;

  var accessToken = parser.accessToken;

  var grantType = parser.grantType;

  if(grantType && grantType!=='client_credentials'){
    return callback(new ApiAuthRequestError('Unsupported grant_type'));
  }

  var authenticator;

  if(authHeaderValue){
    if(authHeaderValue.match(/Basic/i)){
      if(grantType){
        authenticator = new OAuthBasicExchangeAuthenticator(
          application,
          req,
          ttl,
          scopeFactory,
          parser.requestedScope
        );
      }else{
        authenticator = new BasicApiAuthenticator(
          application,
          authHeaderValue
        );
      }
    }else if(authHeaderValue.match(/Bearer/i)){
      authenticator = new OauthAccessTokenAuthenticator(
        self,
        authHeaderValue.replace(/Bearer /i,''),
        callback
      );
    }else{
      return callback(new ApiAuthRequestError('Invalid Authorization value',400));
    }
  }else if(accessToken){
    authenticator = new OauthAccessTokenAuthenticator(self, accessToken, callback);
  }

  if(!authenticator){
    return callback(new ApiAuthRequestError('Must provide access_token.',401));
  }

  if(authenticator instanceof Error){
    return callback(authenticator);
  }

  authenticator.authenticate(callback);

};


//TODO: AccountStoreMapping functionality

Application.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accountStoreMappings.href, options, require('./AccountStoreMapping'), callback);
};

Application.prototype.getDefaultAccountStore = function getDefaultAccountStore(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!self.defaultAccountStoreMapping) {
    return callback();
  }

  return self.dataStore.getResource(self.defaultAccountStoreMapping.href, options, require('./AccountStoreMapping'), callback);
};

Application.prototype.setDefaultAccountStore = function setDefaultAccountStore(store, callback) {
  var AccountStoreMapping = require('./AccountStoreMapping');
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  self.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }

    res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href);}, onAsmFound);
  });

  function onAsmFound(asm) {
    if (asm) {
      asm.isDefaultAccountStore = true;
      return asm.save(clearCache);
    }

    var mapping = { isDefaultAccountStore: true };
    AccountStoreMapping.prototype.setApplication.call(mapping, self);
    AccountStoreMapping.prototype.setAccountStore.call(mapping, store);
    return self.dataStore.createResource('/accountStoreMappings', null, mapping, AccountStoreMapping, clearCache);
  }

  function clearCache(err, map) {
    if (err) {
      return callback(err);
    }

    self.dataStore._evict(self.href, function(err){
      if (err) {
        return callback(err);
      }

      callback(null, map);
    });
  }
};

Application.prototype.getDefaultGroupStore = function getDefaultGroupStore(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!self.defaultGroupStoreMapping) {
    return callback();
  }

  return self.dataStore.getResource(self.defaultGroupStoreMapping.href, options, require('./AccountStoreMapping'), callback);
};

Application.prototype.setDefaultGroupStore = function setDefaultGroupStore(store, callback) {
  var AccountStoreMapping = require('./AccountStoreMapping');
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  self.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }
    res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href);}, onAsmFound);
  });

  function onAsmFound(asm) {
    if (asm) {
      asm.isDefaultGroupStore = true;
      return asm.save(updateApp);
    }

    var mapping = { isDefaultGroupStore: true };
    AccountStoreMapping.prototype.setApplication.call(mapping, self);
    AccountStoreMapping.prototype.setAccountStore.call(mapping, store);

    return self.dataStore.createResource('/accountStoreMappings', null, mapping, AccountStoreMapping, updateApp);
  }

  function updateApp(err, map) {
    if (err) {
      return callback(err);
    }

    self.dataStore._evict(self.href, function(err){
      if (err) {
        return callback(err);
      }

      callback(null, map);
    });
  }
};

Application.prototype.createAccountStoreMapping = function createAccountStoreMapping(mapping, callback) {
  var AccountStoreMapping = require('./AccountStoreMapping');
  AccountStoreMapping.prototype.setApplication.call(mapping, this);
  return this.dataStore.createResource('/accountStoreMappings', null, mapping, require('./AccountStoreMapping'), callback);
};

Application.prototype.addAccountStore = function addAccountStore(store, callback) {
  var AccountStoreMapping = require('./AccountStoreMapping');
  var mapping = {};
  AccountStoreMapping.prototype.setApplication.call(mapping, this);
  AccountStoreMapping.prototype.setAccountStore.call(mapping, store);
  return this.dataStore.createResource('/accountStoreMappings', null, mapping, AccountStoreMapping, callback);
};

Application.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.customData.href, options, require('./CustomData'), callback);
};

module.exports = Application;
