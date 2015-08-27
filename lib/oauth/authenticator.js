'use strict';

var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var JwtAuthenticator = require('../jwt/jwt-authenticator');
var OAuthPasswordGrantRequestAuthenticator = require('../oauth/password-grant').authenticator;
var OAuthRefreshTokenGrantRequestAuthenticator = require('../oauth/refresh-grant').authenticator;

function OAuthAuthenticator(application) {
  if (!(this instanceof OAuthAuthenticator)) {
    return new OAuthAuthenticator(application);
  }else{
    this.application = application;
    return this;
  }
}

OAuthAuthenticator.prototype.localValidation = false;

OAuthAuthenticator.prototype.withLocalValidation = function withLocalValidation() {
  this.localValidation = true;
  return this;
};

OAuthAuthenticator.prototype.authenticate = function authenticate(req,callback){
  var self = this;
  var done;
  if(typeof req==='object' && typeof callback === 'function'){
    done = callback;
  }else{
    throw new Error('authenticate must be called with a request object and callback function');
  }
  var authHeader = req && req.headers && req.headers.authorization;

  if (authHeader){
    if(authHeader.match(/Bearer/i)){
      var parts = authHeader.split(' ');
      var token = parts[parts.length-1];
      new JwtAuthenticator(self.application).authenticate(token,done);
    }else{
      done(self.unauthenticated());
    }
  }else if (req.body && req.body.grant_type==='password'){
    new OAuthPasswordGrantRequestAuthenticator(self.application).authenticate(req.body,callback);
  }else if (req.body && req.body.grant_type==='refresh_token'){
    new OAuthRefreshTokenGrantRequestAuthenticator(self.application).authenticate(req.body,callback);
  }else{
    done(self.unauthenticated());
  }
  return this;
};

OAuthAuthenticator.prototype.unauthenticated = function unauthenticated(){
  return new ApiAuthRequestError('Unauthorized', 401);
};

module.exports = OAuthAuthenticator;
