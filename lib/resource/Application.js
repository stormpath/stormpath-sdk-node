'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');
var ApiKeyEncryptedOptions = require('../authc/ApiKeyEncryptedOptions');
var BasicApiAuthenticator = require('../authc/BasicApiAuthenticator');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var OAuthBasicExchangeAuthenticator = require('../authc/OAuthBasicExchangeAuthenticator');
var OauthAccessTokenAuthenticator = require('../authc/OauthAccessTokenAuthenticator');

function Application() {
  Application.super_.apply(this, arguments);
}
utils.inherits(Application, InstanceResource);

Application.prototype.authenticateAccount = function authenticateApplicationAccount(authcRequest, callback) {
  var _this = this,
    username = authcRequest.username,
    password = authcRequest.password,
    type = authcRequest.type || 'basic';

  var loginAttempt = {
    type: type,
    value: utils.base64.encode(username + ":" + password)
  };

  _this.dataStore.createResource(_this.loginAttempts.href, {expand: 'account'}, loginAttempt, require('./AuthenticationResult'), callback);
};

Application.prototype.sendPasswordResetEmail = function sendApplicationPasswordResetEmail(emailOrUsername, callback) {
  var self = this;
  return self.dataStore.createResource(self.passwordResetTokens.href, {email:emailOrUsername}, callback);
};

Application.prototype.verifyPasswordResetToken = function verifyApplicationPasswordResetToken(token, callback) {
  var self = this;
  var href = self.passwordResetTokens.href + "/" + token;
  return self.dataStore.getResource(href, callback);
};

Application.prototype.getAccounts = function getApplicationAccounts(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accounts.href, options, require('./Account'), callback);
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

Application.prototype.getApiKey = function(/* apiKeyId, callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var apiKeyId = args.shift();
  var callback = args.pop();

  var options = new ApiKeyEncryptedOptions(apiKeyId);
  return self.dataStore.getResource(self.apiKeys.href, options, require('./ApiKey'), function(err,result){
    if(err){
      callback(err);
    }else if(result instanceof require('./ApiKey')){
      callback(null,result);
    }else if(result && result.items && result.items.length === 1 ){
      callback(null,result.items[0]);
    }else{
      callback(new Error('ApiKey not found'));
    }
  });
};

var contentTypeRegExp = new RegExp('application/x-www-form-urlencoded');

Application.prototype.authenticateApiRequest = function(/* request, callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var request = args.shift();
  var callback = args.pop();
  if(!request || typeof request !== 'object'){
    return callback(new ApiAuthRequestError('Request must be an object'));
  }
  if(typeof request.headers !== 'object'){
    return callback(new ApiAuthRequestError('Request must have a headers object'));
  }

  var authHeaderValue = request.headers.authorization || '';
  var contentType = request.headers['content-type'] || '';
  var isFormEncoded = contentTypeRegExp.test(contentType);

  if(isFormEncoded && typeof request.body !== 'object'){
    return callback(new Error('request.body must be an object, please use connect.bodyParser() or another strategy for pasing the post body into an form key/value object.'));
  }
  if(authHeaderValue){
    if(authHeaderValue.match(/Basic/i)){
      if(isFormEncoded){
        if(request.body.grant_type && request.body.grant_type==='client_credentials'){
          new OAuthBasicExchangeAuthenticator(self, request, callback);
        }else{
          return callback(new ApiAuthRequestError('Unsupported grant_type'));
        }
      }else{
        new BasicApiAuthenticator(self, request, callback);
      }
    }else if(authHeaderValue.match(/Bearer/i)){
      return new OauthAccessTokenAuthenticator(self,request.headers.authorization.replace(/Bearer /i,''),callback);
    }else{
      return callback(new ApiAuthRequestError('Unsupported Authorization type'));
    }
  }else if(isFormEncoded && request.body.access_token){
    new OauthAccessTokenAuthenticator(self, request.body.access_token, callback);
  }else{
    return callback(new ApiAuthRequestError('Invalid authentication request.  Must provide access_token, or request access token.'));
  }
};


//TODO: AccountStoreMapping functionality

module.exports = Application;
