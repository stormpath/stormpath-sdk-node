'use strict';

var jwt = require('jwt-simple');
var utils = require('../utils');
var AuthenticationResult = require('./AuthenticationResult');

function OauthAccessTokenResult() {
  OauthAccessTokenResult.super_.apply(this, arguments);
  this.scopes = [];
  this.ttl = 1000*60*60; // one hour
}
utils.inherits(OauthAccessTokenResult, AuthenticationResult);

OauthAccessTokenResult.prototype.addScope = function(scope) {
  this.scopes.push(scope);
};

OauthAccessTokenResult.prototype.setTtl = function(ttl) {
  this.ttl = ttl;
};

OauthAccessTokenResult.prototype.getTokenResponse = function getTokenResponse() {
  var self = this;
  var _jwt = {
    client_id: self.id,
    timestamp: new Date().getTime(),
    expires_in: new Date().getTime() + self.ttl //one hour
  };
  if(self.scopes.length>0){
    _jwt.scope = self.scopes.join(' ');
  }
  return jwt.encode(_jwt,self.dataStore.requestExecutor.options.apiKey.secret,'HS256');
};

module.exports = OauthAccessTokenResult;