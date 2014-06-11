'use strict';

var jwt = require('jwt-simple');
var utils = require('../utils');
var AuthenticationResult = require('./AuthenticationResult');

function OauthAccessTokenResult() {
  OauthAccessTokenResult.super_.apply(this, arguments);
  this.scopes = [];
}
utils.inherits(OauthAccessTokenResult, AuthenticationResult);

OauthAccessTokenResult.prototype.addScope = function(scope) {
  this.scopes.push(scope);
};

OauthAccessTokenResult.prototype.getTokenResponse = function getTokenResponse() {
  var self = this;
  var _jwt = {
    client_id: self.id,
    timestamp: new Date().getTime(),
    expires_in: new Date().getTime() + (1000*60*60) //one hour
  };
  if(self.scopes.length>0){
    _jwt.scope = self.scopes.join(' ');
  }
  return jwt.encode(_jwt,self.dataStore.requestExecutor.options.apiKey.secret,'HS256');
};

module.exports = OauthAccessTokenResult;