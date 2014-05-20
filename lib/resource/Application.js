'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

var uuid = require('node-uuid');
var crypto = require('crypto');
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
  var e = encodeURIComponent;
  var e64 = function(v){
    return new Buffer(v).toString('base64');
  };

  var p = url.parse(self.href);
  var base = p.protocol + '//' + p.host;
  var apiKey = self.dataStore.requestExecutor.options.apiKey;
  var output = '';
  var nonce = e64(uuid());
  var state = e(options.state || '');
  output += base + '/oauth/authorize';
  output += ('?client_id=' + apiKey.id);
  output += ('&redirect_uri=' + e(options.redirect_uri));
  output += '&response_type=id_token';
  output += ('&application_href=' + e(self.href));
  output += ('&path=' + e(options.path || '/'));
  output += ('&state=' + state);
  output += '&scope=sso';
  output += ('&nonce=' + nonce);
  output += ('&timestamp=' + new Date().getTime());

  var digest = crypto.createHmac('sha256',apiKey.secret).update(output).digest('base64');

  output += ('&digest=' + digest);

  self.nonce_cache[nonce] = state;

  return output;
};

Application.prototype.parseSsoResponse = function(uri,callback) {
  var self = this;
  var params = (url.parse(uri,true).query) || {};
  var token = params.id_token || '';
  var clientState = params.state || '';
  var secret = self.dataStore.requestExecutor.options.apiKey.secret;
  var jwtObject, nonce, accountHref;

  try{
    jwtObject = jwt.decode(token, secret);
    nonce = jwtObject.nonce;
    accountHref = jwtObject.sub;
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

  return self.dataStore.getResource(accountHref, null, require('./Account'), callback);
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
