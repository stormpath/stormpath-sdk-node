'use strict';

var nJwt = require('njwt');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function AuthenticationResult() {
  AuthenticationResult.super_.apply(this, arguments);
  Object.defineProperty(this, 'application', { enumerable:false, writable:true });
  Object.defineProperty(this, 'forApiKey', { enumerable:false, writable:true });
  Object.defineProperty(this, 'ttl', { enumerable:false, writable:true, value: 3600 });
}

utils.inherits(AuthenticationResult, InstanceResource);

AuthenticationResult.prototype.getAccount = function getAuthenticationResultAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

AuthenticationResult.prototype.getJwt = function getJwt() {
  var secret = this.application.dataStore.requestExecutor
    .options.client.apiKey.secret;

  var jwt = nJwt.create({
    iss: this.application.href,
    sub: this.forApiKey ? this.forApiKey.id : this.account.href,
    jti: utils.uuid()
  }, secret);

  jwt.setExpiration(new Date().getTime() + (this.ttl * 1000));

  return jwt;
};

AuthenticationResult.prototype.getAccessToken = function getAccessToken(jwt) {
  return (jwt || this.getJwt()).compact();
};

AuthenticationResult.prototype.getAccessTokenResponse = function getAccessTokenResponse(jwt) {
  jwt = jwt || this.getJwt();

  var resp = {
    'access_token': jwt.compact(),
    'token_type': 'Bearer',
    'expires_in': this.ttl
  };

  if(jwt.body.scope){
    resp.scope = jwt.body.scope;
  }

  return resp;
};

module.exports = AuthenticationResult;
