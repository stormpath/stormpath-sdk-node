'use strict';

var util = require('util');

var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');


function OAuthRefreshTokenGrantAuthenticationResult(application,data){
  if (!(this instanceof OAuthRefreshTokenGrantAuthenticationResult)) {
    return new OAuthRefreshTokenGrantAuthenticationResult(application,data);
  }
  OAuthRefreshTokenGrantAuthenticationResult.super_.apply(this, arguments);

  this.accessTokenResponse = data;


}
util.inherits(OAuthRefreshTokenGrantAuthenticationResult, JwtAuthenticationResult);

function OAuthRefreshTokenGrantAuthenticator(application) {
  if (!(this instanceof OAuthRefreshTokenGrantAuthenticator)) {
    return new OAuthRefreshTokenGrantAuthenticator(application);
  }
  this.application = application;
  return this;
}
OAuthRefreshTokenGrantAuthenticator.prototype.authenticate = function authenticate(data,callback) {
  var self = this;
  if(arguments.length !==2 ){
    throw new Error('Must call authenticate with (data,callback)');
  }else if (!data.refresh_token){
    throw new Error('data does not have refresh_token property');
  }else{
    var href = this.application.href + '/oauth/token';
    var formData = {
      grant_type: 'refresh_token',
      refresh_token: data.refresh_token
    };
    this.application.dataStore.createResource(href,{form:formData},function(err,data){
      if(err){
        return callback(err);
      }
      callback(null,new OAuthRefreshTokenGrantAuthenticationResult(self.application,data));
    });
  }
};

module.exports = {
  authenticator: OAuthRefreshTokenGrantAuthenticator,
  authenticationResult: OAuthRefreshTokenGrantAuthenticationResult
};