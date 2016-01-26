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
var PasswordResetToken = require('./PasswordResetToken');
var errorMessages = require('../error/messages');
var utils = require('../utils');

/**
 * @class Application
 *
 * @augments {InstanceResource}
 *
 * @param {Object} applicationData
 * The raw JSON data of the Application resource, as retrieved from the Stormpath
 * REST API.
 *
 * @description
 *
 * This object encapsulates a Stormpath Application object, and provides methods
 * for working with the Application.
 *
 * An Application resource in Stormpath contains information about any
 * real-world software that communicates with Stormpath via REST APIs. You
 * control who may log in to an application by assigning (or ‘mapping’) one or
 * more Directory, Group, or Organization resources (generically called Account
 * Stores) to an Application resource. The Accounts in these associated Account
 * Stores collectively form the application’s user base.
 *
 * Typically you do not need to manually construct an Application object.
 * Rather, you will obtain an Application from methods such as
 * {@link Client#getApplication Client.getApplication()}.
 *
 * For more information about the Application resource, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#application REST API Reference: Application}.
 *
 * For mor information about how authorization works, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/005_auth_n.html Authenticating Accounts with Stormpath}.
 */
function Application() {
  Application.super_.apply(this, arguments);
}
utils.inherits(Application, InstanceResource);

/**
 * Creates a URL which will redirect a user to your ID Site.  The URL will look
 * like `https://api.stormpath.com/v1/sso?jwtRequest=<token>`.  Once the URL
 * is created, you should issue a 302 redirect to this URL.  The `/sso`
 * endpoint will consume the request, and then redirect the user to your ID
 * Site application.  This entire process happens over HTTPS and all the JWTs
 * are signed with secret keys for security.
 *
 * When the user returns from ID Site, you will handle the response with
 * {@link Application#handleIdSiteCallback Application.handleIdSiteCallback()}.
 *
 * For more information, please see
 * {@link http://docs.stormpath.com/guides/using-id-site/ Using Stormpath's ID Site to Host your User Management UI}.
 *
 * @param  {Object} options ID Site redirect options
 *
 * @param {String} options.callbackUri
 * **REQUIRED**.  The fully-qualified location where the user should be sent
 * after they authenticate on the ID Site application, e.g.
 * `https://www.mysite.com/dashboard`.  For security reasons, this url must be
 * registered as an authorized callbac URI in your ID Site configuration.  This
 * can be managed via the REAT API or the Stormpath Admin Console.
 *
 * @param {Boolean} options.logout=false
 * If `true`, the user will be logged out of their session and immediately
 * redirected to the sepcified `callbackUri`.
 *
 * @return {String} The URL to redirect the user to.
 *
 * @param {String} options.organizationNameKey=null
 * *Multi-tenancy option.*
 *
 * The organization name key to auto-fill in the
 * Organization field on ID Site.  This value will be fixed and the user cannot change it.  Use this if you
 * already know which Organization the user will be logging into.
 *
 * If there is no organization with that name key, or the organization is not
 * mapped to the current Stormpath Application, an error will be returned to the
 * callback URI.
 *
 * @param {String} options.showOrganizationField=null
 * *Multi-tenancy option.*
 *
 * If `true`, show the organization field on ID Site, so that the user must
 * provide the name key of the organization that they wish to log into.
 *
 * If `false`, and `organizationNameKey` is defined, then the Organization field
 * will be hidden but the authentcation attempt will still be targeted at the
 * specified organization.
 *
 * @param {String} options.state=null
 * Custom string that can be used to carry state through the request.  This
 * state property will be available in the JWT payload on ID Site, and in the
 * JWT that is provided to your callback URI.
 *
 * @param {String} options.useSubDomain
 * Use the provided `organizationNameKey` as the domain prefix for the ID Site
 * URL. For example, if `organizationNameKey` is org-a and your ID Site URL
 * is `https://id.myapp.com` then the user will be redirected to
 * `https://org-a.id.myapp.com`.
 *
 */
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

/**
 * This method will parse the JWT result from an ID Site Callback, and give you
 * an {@link IdSiteAuthenticationResult}, which contains the  {@link Account}
 * object of the account that was authenticated.
 *
 * @param  {String}   responseUri The URL that the user has arrived on your site
 * with.  For example, `http://mysite.com/idSiteCallback?jwtResponse=xxx`.
 * @param  {Function} Will be called with
 * (err, {@link IdSiteAuthenticationResult idSiteAuthenticationResult}).
 */
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
          /**
           * @typedef {Object} IdSiteAuthenticationResult
           *
           * @property {Object} account
           * The {@link Account account} that was authenticated on ID Site.
           *
           * @property {String} state
           * Custom state that was passed to ID Site, via the original request
           * from
           * {@link Application#createIdSiteUrl Application.createIdSiteUrl()}.
           *
           * @property {String} isNew
           * Indicates that this account is a new account, and the registration
           * was completed on ID Site.
           *
           * @property {String} status
           * Indicates the action that the user completed on ID Site, which will
           * be one of the following:
           *
           * * `AUTHENTICATED` - The user already had an account and they
           *   successfully authenticated ("logged in").
           * * `REGISTERED` - The user created a new account on ID Site.
           * * `LOGOUT` - The user has logged out.
           *
           */
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
/**
 * Attempt to authenticate an account, using username/email and password.  Use
 * this method to assert that the supplied password is the correct password for
 * an account.
 *
 * @param  {Object} authenticationRequest
 * Authentication request object, can only be used for username & password
 * authentication.
 *
 * @param  {Object} authenticationRequest.username The username, or email
 * address, of an {@link Account} that exists in a {@link Directory}.
 * @param  {Object} authenticationRequest.password The password for the account.
 * @param  {Function} callback Callback function, called with
 * (err, {@link AuthenticationResult authenticationResult}).
 *
 * @example
 * var authenticationRequest = {
 *  username: 'user@mysite.com', // can be username or email address of account
 *  password: 'RawPassw0rd!'
 *};
 *
 * application.authenticateAccount(authenticationRequest, function(err, result) {
 *   // if successful, the result will have an account field with the successfully authenticated account:
 *   result.getAccount(function(err, account) {
 *     console.log(account);
 *   });
 * };
 */
Application.prototype.authenticateAccount = function authenticateApplicationAccount(authenticationRequest, callback) {
  var _this = this,
    username = authenticationRequest.username,
    password = authenticationRequest.password,
    type = authenticationRequest.type || 'basic';
  var accountStore = ('string' === typeof authenticationRequest.accountStore) ?
    {href: authenticationRequest.accountStore} :
    authenticationRequest.accountStore;

  var loginAttempt = {
    type: type,
    value: utils.base64.encode(username + ':' + password)
  };

  if (authenticationRequest.accountStore){
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

/**
 * Sends a password reset email to the account holder.  This email will contain
 * a link with a password reset token.  The format of the link is controlled by
 * the Password Policy of the {@link Directory} that the account is in.  For
 * more information on the email, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/004_accnt_mgmt.html#manage-password-reset-emails Manage Password Reset Emails}.
 *
 * If you want to work with the token (e.g. to manually send your own email with
 * the token) you can do so by working with the {@link PasswordResetToken}
 * instance that is provided to the callback.
 *
 * @param  {Object} passwordResetRequest The password reset request object.
 *
 * @param {String} passwordResetRequest.email
 * The email address of the account that you wish to send a password reset email
 * to.
 *
 * @param {Object} [passwordResetRequest.accountStore]
 * An object that allows you to define an account store for this request.
 *
 * @param {Object} passwordResetRequest.accountStore.href
 * The HREF of the account store that you wish to target, for locating the
 * the account object.
 *
 * @param  {Function} callback
 * Callback function, will be called with (err, {@link PasswordResetToken passwordResetToken})
 *
 * @example
 * var passwordResetRequest = {
 *   email: 'foo@bar.com'
 * };
 *
 * application.sendPasswordResetEmail(passwordResetRequest, function(err, passwordResetToken) {
 *  // The token is the last part of the HREF
 *  console.log(passwordResetToken.href.split('/').pop());
 *
 *  // The account can be retrieved by using the account href on the result
 *  client.getAccount(passwordResetToken.account.href, function(err, account) {
 *    console.log(account);
 *  });
 * });
 */
Application.prototype.sendPasswordResetEmail = function sendApplicationPasswordResetEmail(passwordResetRequest, callback) {
  // @TODO - deprecate the string-only version
  var data = typeof passwordResetRequest === 'string' ? {
    email: passwordResetRequest
  } : passwordResetRequest;
  return this.dataStore.createResource(this.passwordResetTokens.href, null, data, PasswordResetToken, callback);
};

/**
 * Re-sends the account verification email to the specified account.
 *
 * @param {Object} resendVerificationEmailRequest
 *
 * @param {String} resendVerificationEmailRequest.login
 *
 * The username or email address of the account that you wish to re-send the
 * verification email to.
 *
 * @param {Object} [resendVerificationEmailRequest.accountStore]
 * An object that allows you to define an account store for this request.
 *
 * @param {Object} resendVerificationEmailRequest.accountStore.href
 * The HREF of the account store that you wish to target, for locating the
 * the account object.
 *
 * @param {Function} callback
 * Callback function, will be called with (err).
 *
 * @example
 * var resendVerificationEmailRequest = {
 *   login: 'foo@bar.com'
 * };
 *
 * application.resendVerificationEmail(resendVerificationEmailRequest, function(err) {
 *   if(!err){
 *     console.log('Email re-sent to ' + resendVerificationEmailRequest.login);
 *   }
 * });
 */
Application.prototype.resendVerificationEmail = function resendVerificationEmail(resendVerificationEmailRequest, callback) {
  return this.dataStore.createResource(this.verificationEmails.href, resendVerificationEmailRequest, callback);
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
