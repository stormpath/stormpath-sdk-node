'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

var uuid = require('node-uuid');
var url = require('url');
var jwt = require('jwt-simple');

function Application() {
  Application.super_.apply(this, arguments);
}
utils.inherits(Application, InstanceResource);

Application.prototype.nonce_cache = {};

Application.prototype.createSsoUrl = function createSsoUrl(_options) {
  var self = this;
  var options = typeof _options === "object" ? _options : {};
  var p = url.parse(self.href);
  var base = p.protocol + '//' + p.host;
  var apiKey = self.dataStore.requestExecutor.options.apiKey;
  var nonce = uuid();
  var state = options.state || '';
  self.nonce_cache[nonce] = state;

  if(!options.cb_uri){
    throw new Error('cb_uri URI must be provided and must be in your SSO whitelist');
  }

  var token = jwt.encode({
    jti: nonce,
    iat: new Date().getTime()/1000,
    iss: apiKey.id,
    sub: self.href,
    state: state,
    path: options.path || '/',
    cb_uri: options.cb_uri
  },apiKey.secret,'HS256');

  var redirectUrl = base + '/sso?jwtRequest=' + token;

  return redirectUrl;
};

Application.prototype.handleSsoResponse = function(/* uri, [responseMode], callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var responseMode = typeof args[1] === 'string' ? args[1] : 'account';
  var callback = typeof args[1] === 'function' ? args[1] : args[2];
  var uri = args[0];
  var params = (url.parse(uri,true).query) || {};
  var token = params.jwtResponse || '';
  var secret = self.dataStore.requestExecutor.options.apiKey.secret;
  var jwtObject, nonce, accountHref, clientState;

  try{
    jwtObject = jwt.decode(token, secret);
    nonce = jwtObject.irt;
    accountHref = jwtObject.sub;
    clientState = jwtObject.state;
  }
  catch(e){
    return callback(e);
  }

  if(!self.nonce_cache[nonce]){
    return callback(new Error('Invalid nonce'));
  }
  if(self.nonce_cache[nonce]!==clientState){
    return callback(new Error('Client state has been modified'));
  }
  delete self.nonce_cache[nonce];

  if(responseMode==='account'){
    return self.dataStore.getResource(accountHref, null, require('./Account'), callback);
  }else if(responseMode==='jwt'){
    return callback(null,jwtObject);
  }else{
    return callback(new Error('Unsupported response mode'));
  }

};

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

//TODO: AccountStoreMapping functionality

module.exports = Application;
