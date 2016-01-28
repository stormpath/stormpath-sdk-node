'use strict';

var async = require('async');
var _ = require('underscore');
var njwt = require('njwt');
var url = require('url');
var uuid = require('node-uuid');

var Account = require('./Account');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var ApplicationAccountStoreMapping = require('./ApplicationAccountStoreMapping');
var AuthenticationResult = require('./AuthenticationResult');
var AuthRequestParser = require('../authc/AuthRequestParser');
var BasicApiAuthenticator = require('../authc/BasicApiAuthenticator');
var InstanceResource = require('./InstanceResource');
var OauthAccessTokenAuthenticator = require('../authc/OauthAccessTokenAuthenticator');
var OAuthBasicExchangeAuthenticator = require('../authc/OAuthBasicExchangeAuthenticator');
var errorMessages = require('../error/messages');
var utils = require('../utils');

function Application() {
  Application.super_.apply(this, arguments);
}
utils.inherits(Application, InstanceResource);

Application.prototype.createIdSiteUrl = function createIdSiteUrl(_options) {
  var options = typeof _options === "object" ? _options : {};
  var p = url.parse(this.href);
  var base = p.protocol + '//' + p.host;
  var apiKey = this.dataStore.requestExecutor.options.client.apiKey;
  var nonce = uuid();
  var state = options.state || '';

  if(!options.callbackUri){
    throw new Error(errorMessages.ID_SITE_INVALID_CB_URI);
  }

  var payload = {
    jti: nonce,
    iat: new Date().getTime()/1000,
    iss: apiKey.id,
    sub: this.href,
    state: encodeURIComponent(state),
    path: options.path || '/',
    cb_uri: options.callbackUri
  };

  if(typeof options.showOrganizationField === 'boolean'){
    payload.sof = options.showOrganizationField;
  }

  if(options.organizationNameKey){
    payload.onk = options.organizationNameKey;
  }

  if(typeof options.useSubDomain === 'boolean'){
    payload.usd = options.useSubDomain;
  }

  var token = njwt.create(payload,apiKey.secret,'HS256');

  var redirectUrl = base + '/sso'+(options.logout?'/logout':'')+'?jwtRequest=' + token;

  return redirectUrl;
};

Application.prototype._decodeJwt = function _decodeJwt(str,secret){
  var jwtObject;
  try{
    jwtObject = njwt.verify(str, secret);
    return jwtObject;
  }
  catch(e){
    return e;
  }
};

Application.prototype.handleIdSiteCallback = function handleIdSiteCallback(responseUri,callback) {
  if(typeof responseUri !== 'string'){
    throw new Error('handleIdSiteCallback must be called with an uri string');
  }

  var cb = typeof callback === 'function' ? callback : utils.noop;

  var params = (url.parse(responseUri,true).query) || {};
  var token = params.jwtResponse || '';

  var dataStore = this.dataStore;
  var secret = dataStore.requestExecutor.options.client.apiKey.secret;
  var apiKeyId = dataStore.requestExecutor.options.client.apiKey.id;

  var responseJwt = this._decodeJwt(token,secret);

  if(responseJwt instanceof Error){
    return cb(responseJwt);
  }

  if(responseJwt.body && responseJwt.body.err){
    return cb(responseJwt.body.err);
  }

  if(responseJwt.body.aud !== apiKeyId){
    return cb(new Error(errorMessages.ID_SITE_JWT_INVALID_AUD));
  }

  if(!utils.isNumber(responseJwt.body.exp) || (utils.nowEpochSeconds() > responseJwt.body.exp)){
    return cb(new Error(errorMessages.ID_SITE_JWT_HAS_EXPIRED));
  }

  var nonce = responseJwt.body.irt;
  var accountHref = responseJwt.body.sub;

  dataStore.nonceStore.getNonce(nonce,function(err,value){
    if(err){
      cb(err);
    }else if(value){
      cb(new Error(errorMessages.ID_SITE_JWT_ALREADY_USED));
    }else{
      dataStore.nonceStore.putNonce(nonce,utils.noop);

      dataStore.getResource(accountHref,Account,function(err,account){
        if(err){
          cb(err);
        }else{
          cb(null,{
            account: account,
            state: decodeURIComponent(responseJwt.body.state),
            isNew: responseJwt.body.isNewSub,
            status: responseJwt.body.status
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

Application.prototype.sendPasswordResetEmail = function sendApplicationPasswordResetEmail(emailOrUsernameOrOptions, callback) {
  var options = typeof emailOrUsernameOrOptions === 'string' ? {
    email: emailOrUsernameOrOptions
  } : emailOrUsernameOrOptions;
  return this.dataStore.createResource(this.passwordResetTokens.href, options, callback);
};

Application.prototype.resendVerificationEmail = function resendVerificationEmail(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.createResource(this.verificationEmails.href, args.options, args.callback);
};

Application.prototype.verifyPasswordResetToken = function verifyApplicationPasswordResetToken(token, callback) {
  var href = this.passwordResetTokens.href + "/" + token;
  return this.dataStore.getResource(href, callback);
};

Application.prototype.resetPassword = function resetApplicationPassword(token, password, callback) {
  var href = this.passwordResetTokens.href + "/" + token;
  return this.dataStore.createResource(href, {expand: 'account'}, { password: password }, callback);
};

Application.prototype.getSamlPolicy = function getSamlPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.samlPolicy.href, args.options, require('./SamlPolicy'), args.callback);
};

Application.prototype.getAccounts = function getApplicationAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

Application.prototype.getAccount = function getAccount(/* providerData, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['providerData', 'options', 'callback']);

  if (!args.callback || !args.providerData || !args.providerData.providerData) {
    throw new Error('Incorrect usage. Usage: Application.getAccount(providerData, [options], callback);');
  }

  var providerData = args.providerData.providerData;

  if (typeof providerData !== 'object' || typeof providerData.providerId !== 'string' || (typeof providerData.code !== 'string' && typeof providerData.accessToken !== 'string')) {
    throw new Error('This method is used to create or access social accounts only. Did you mean to call Client.getAccount(href)?');
  }

  function wrapCallback(cb) {
    return function(err, account) {
      if (err) {
        return cb(err);
      }

      var isNew = account._isNew;
      delete account._isNew;

      cb(err, { account: account, created: isNew });
    };
  }

  return this.dataStore.createResource(this.accounts.href, args.options, args.providerData, require('./Account'), wrapCallback(args.callback));
};

Application.prototype.createAccount = function createApplicationAccount(/* account, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);
  return this.dataStore.createResource(this.accounts.href, args.options, args.account, require('./Account'), args.callback);
};

Application.prototype.getGroups = function getApplicationGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

Application.prototype.createGroup = function createApplicationGroup(/* group, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback']);
  return this.dataStore.createResource(this.groups.href, args.options, args.group, require('./Group'), args.callback);
};

Application.prototype.getOAuthPolicy = function getOAuthPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.oAuthPolicy.href, args.options, require('./InstanceResource'), args.callback);
};

Application.prototype.getTenant = function getApplicationTenant(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

Application.prototype.getApiKey = function getApiKey(apiKeyId, options, callback) {
  var argCount = Array.prototype.slice.call(arguments).length;
  var cb = argCount === 3 ? callback : options;

  var dataStore = this.dataStore;
  var opts = _.extend({},dataStore.apiKeyEncryptionOptions,argCount === 3 ? options : {id:apiKeyId});

  return dataStore.getResource(this.apiKeys.href, opts, require('./ApiKey'), function(err,result){
    if(err){
      cb(err);
    }else if(result instanceof require('./ApiKey')){
      // this happens if we found it in the cache.  manually 'expand' the account
      dataStore.getResource(result.account.href,function(err,account){
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
  if(typeof options!=='object'){
    throw new ApiAuthRequestError({userMessage: 'options must be an object' });
  }

  if(typeof options.request!=='object'){
    throw new ApiAuthRequestError({userMessage: 'options.request must be an object' });
  }

  if(options.ttl && (typeof options.ttl!=='number')){
    throw new ApiAuthRequestError({userMessage: 'ttl must be a number'});
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

  var req = options.request;

  var scopeFactory = typeof options.scopeFactory === 'function' ? options.scopeFactory : null;

  var parser = new AuthRequestParser(req,locationsToSearch);

  var authHeaderValue = parser.authorizationValue;

  var accessToken = parser.accessToken;

  var grantType = parser.grantType;

  if(grantType && grantType!=='client_credentials'){
    return callback(new ApiAuthRequestError({userMessage: 'Unsupported grant_type'}));
  }

  var authenticator;

  if(authHeaderValue){
    if(authHeaderValue.match(/Basic/i)){
      if(grantType){
        authenticator = new OAuthBasicExchangeAuthenticator(
          this,
          req,
          ttl,
          scopeFactory,
          parser.requestedScope
        );
      }else{
        authenticator = new BasicApiAuthenticator(
          this,
          authHeaderValue,
          ttl
        );
      }
    }else if(authHeaderValue.match(/Bearer/i)){
      authenticator = new OauthAccessTokenAuthenticator(
        this,
        authHeaderValue.replace(/Bearer /i,''),
        ttl
      );
    }else{
      return callback(new ApiAuthRequestError({userMessage: 'Invalid Authorization value', statusCode: 400}));
    }
  }else if(accessToken){
    authenticator = new OauthAccessTokenAuthenticator(this, accessToken, ttl);
  }

  if(!authenticator){
    return callback(new ApiAuthRequestError({userMessage: 'Must provide access_token.', statusCode: 401}));
  }

  if(authenticator instanceof Error){
    return callback(authenticator);
  }

  authenticator.authenticate(callback);
};

Application.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountStoreMappings.href, args.options, ApplicationAccountStoreMapping, args.callback);
};

Application.prototype.getDefaultAccountStore = function getDefaultAccountStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultAccountStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultAccountStoreMapping.href, args.options, ApplicationAccountStoreMapping, args.callback);
};

Application.prototype.setDefaultAccountStore = function setDefaultAccountStore(store, callback) {
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  this.getAccountStoreMappings(function (err, res) {
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

    var mapping = new ApplicationAccountStoreMapping({ isDefaultAccountStore: true })
      .setApplication(self)
      .setAccountStore(store);

    return self.dataStore.createResource('/accountStoreMappings', null, mapping, ApplicationAccountStoreMapping, clearCache);
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
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultGroupStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultGroupStoreMapping.href, args.options, ApplicationAccountStoreMapping, args.callback);
};

Application.prototype.setDefaultGroupStore = function setDefaultGroupStore(store, callback) {
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  this.getAccountStoreMappings(function (err, res) {
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

    var mapping = new ApplicationAccountStoreMapping({ isDefaultGroupStore: true })
      .setApplication(self)
      .setAccountStore(store);

    return self.dataStore.createResource('/accountStoreMappings', null, mapping, ApplicationAccountStoreMapping, updateApp);
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

Application.prototype.createAccountStoreMapping = function createAccountStoreMapping(/* mapping, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['mapping', 'options', 'callback']);

  args.mapping = new ApplicationAccountStoreMapping(args.mapping).setApplication(this);

  return this.dataStore.createResource('/accountStoreMappings', args.options, args.mapping, ApplicationAccountStoreMapping, args.callback);
};

Application.prototype.createAccountStoreMappings = function createAccountStoreMappings(mappings,callback){
  var self = this;
  async.mapSeries(mappings,function(mapping,next){
    self.createAccountStoreMapping(mapping,next);
  },callback);
};

/*
  @TODO - remove this in version 1.0, use createAccountStoreMapping() instead
 */

Application.prototype.addAccountStore = function addAccountStore(store, callback) {
  var mapping = new ApplicationAccountStoreMapping().setAccountStore(store).setApplication(this);
  return this.dataStore.createResource('/accountStoreMappings', null, mapping, ApplicationAccountStoreMapping, callback);
};

Application.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = Application;
