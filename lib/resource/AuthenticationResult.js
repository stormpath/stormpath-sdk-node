'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');
var nJwt = require('njwt');

function AuthenticationResult() {
  AuthenticationResult.super_.apply(this, arguments);
  Object.defineProperty(this, 'application', {enumerable:false,writable:true});
  Object.defineProperty(this, 'forApiKey', {enumerable:false,writable:true});
}
utils.inherits(AuthenticationResult, InstanceResource);

AuthenticationResult.prototype.getAccount = function getAuthenticationResultAccount(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.account.href, options, require('./Account'), callback);
};

AuthenticationResult.prototype.getJwt = function getJwt() {
  var self = this;
  return nJwt.Jwt({
    iss: self.application.href,
    sub: self.forApiKey ? self.forApiKey.id : self.account.href,
    jti: utils.uuid()
  }).signWith('HS256',self.application.dataStore.requestExecutor.options.apiKey.secret).setTtl(3600);
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