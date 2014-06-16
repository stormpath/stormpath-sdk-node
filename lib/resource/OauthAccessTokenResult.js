'use strict';

var jwt = require('jwt-simple');
var utils = require('../utils');
var AuthenticationResult = require('./AuthenticationResult');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var nowEpochSeconds = utils.nowEpochSeconds;

var isNumber = new RegExp(/[0-9]+/);

function OauthAccessTokenResult() {
  OauthAccessTokenResult.super_.apply(this, arguments);
  this.scopes = [];
  this.ttl = 60*60; // one hour, as seconds
}
utils.inherits(OauthAccessTokenResult, AuthenticationResult);

OauthAccessTokenResult.prototype.addScope = function(scope) {
  this.scopes.push(scope);
};

OauthAccessTokenResult.prototype.setTtl = function(ttl) {
  if(!isNumber.test(ttl)){
    throw new ApiAuthRequestError('ttl must be a number');
  }
  this.ttl = parseInt(ttl,10);
};

OauthAccessTokenResult.prototype.setApplicationHref = function(href) {
  this.applicationHref = href;
};

OauthAccessTokenResult.prototype.getTokenResponse = function getTokenResponse() {
  var self = this;
  var response = {
    "access_token": self.getToken(),
    "token_type":"bearer",
    "expires_in": self.ttl
  };
  return response;
};

OauthAccessTokenResult.prototype.getToken = function getToken() {
  var self = this;
  var now = nowEpochSeconds();
  var _jwt = {
    sub: self.id,
    iss: self.applicationHref,
    iat: now,
    exp: now + self.ttl
  };
  if(self.scopes.length>0){
    _jwt.scope = self.scopes.join(' ');
  }
  return jwt.encode(_jwt,self.dataStore.requestExecutor.options.apiKey.secret,'HS256');
};

module.exports = OauthAccessTokenResult;