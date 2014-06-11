'use strict';

var utils = require('../utils');
var AuthenticationResult = require('./AuthenticationResult');

function OauthAuthenticationResult() {
  OauthAuthenticationResult.super_.apply(this, arguments);
}
utils.inherits(OauthAuthenticationResult, AuthenticationResult);

OauthAuthenticationResult.prototype.getScopes = function() {
  return this.scopes;
};

OauthAuthenticationResult.prototype.getToken = function getToken() {
  return this.token;
};
OauthAuthenticationResult.prototype.getJwt = function getJwt() {
  return this.jwtObject;
};

module.exports = OauthAuthenticationResult;