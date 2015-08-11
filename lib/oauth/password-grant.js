'use strict';

var util = require('util');

var OAuthAuthenticationResult = require('./authentication-result');


function OAuthPasswordGrantAuthenticationResult(application,data){
  if (!(this instanceof OAuthPasswordGrantAuthenticationResult)) {
    return new OAuthPasswordGrantAuthenticationResult(application,data);
  }
  OAuthPasswordGrantAuthenticationResult.super_.apply(this, arguments);

  this.accessTokenResponse = data;


}
util.inherits(OAuthPasswordGrantAuthenticationResult, OAuthAuthenticationResult);

function OAuthPasswordGrantRequestAuthenticator(application) {
  if (!(this instanceof OAuthPasswordGrantRequestAuthenticator)) {
    return new OAuthPasswordGrantRequestAuthenticator(application);
  }
  this.application = application;
  return this;
}
OAuthPasswordGrantRequestAuthenticator.prototype.authenticate = function authenticate(data,callback) {
  var self = this;
  if(!data){
    throw new Error('Must suppply data body to authenticate()');
  }else{
    var href = this.application.href + '/oauth/token';
    data.grant_type='password';
    this.application.dataStore.createResource(href,{form:data},function(err,data){
      if(err){
        return callback(err);
      }
      callback(null,new OAuthPasswordGrantAuthenticationResult(self.application,data));
    });
  }
};

module.exports = {
  authenticator: OAuthPasswordGrantRequestAuthenticator,
  authenticationResult: OAuthPasswordGrantAuthenticationResult
};