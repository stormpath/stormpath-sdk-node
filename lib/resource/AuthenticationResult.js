'use strict';

var nJwt = require('njwt');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function AuthenticationResult() {
  AuthenticationResult.super_.apply(this, arguments);
  Object.defineProperty(this, 'application', {enumerable:false,writable:true});
  Object.defineProperty(this, 'forApiKey', {enumerable:false,writable:true});
}
utils.inherits(AuthenticationResult, InstanceResource);

AuthenticationResult.prototype.getAccount = function getAuthenticationResultAccount(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.account.href, options, require('./Account'), callback);
};

AuthenticationResult.prototype.getJwt = function getJwt() {
  return nJwt.create({
    iss: this.application.href,
    sub: this.forApiKey ? this.forApiKey.id : this.account.href,
    jti: utils.uuid()
  },this.application.dataStore.requestExecutor.options.client.apiKey.secret)
  .setExpiration(new Date().getTime() + (3600*1000));
};

AuthenticationResult.prototype.getAccessToken = function getAccessToken(jwt) {
  return (jwt || this.getJwt()).compact();
};

AuthenticationResult.prototype.getAccessTokenResponse = function getAccessTokenResponse(jwt) {

  jwt = jwt || this.getJwt();
  var resp = {
    'access_token': jwt.compact(),
    'token_type': 'Bearer',
    'expires_in': jwt.ttl
  };
  if(jwt.body.scope){
    resp.scope = jwt.body.scope;
  }
  return resp;
};

module.exports = AuthenticationResult;
