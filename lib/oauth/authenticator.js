'use strict';

var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var JwtAuthenticator = require('../jwt/jwt-authenticator');
var OAuthPasswordGrantRequestAuthenticator = require('../oauth/password-grant').authenticator;
var OAuthRefreshTokenGrantRequestAuthenticator = require('../oauth/refresh-grant').authenticator;

function retrieveAuthTokenFromRequest(req) {
  var authHeader = req && req.headers && req.headers.authorization;

  if (!authHeader || !authHeader.match(/Bearer/i)) {
    return false;
  }

  return authHeader.split(' ').pop();
}

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

OAuthAuthenticator.prototype.authenticate = function authenticate(req, callback){
  if (typeof req !== 'object' || typeof callback !== 'function') {
    throw new Error('authenticate must be called with a request object and callback function');
  }

  var authenticator = null;
  var token = retrieveAuthTokenFromRequest(req);

  if (token) {
    authenticator = new JwtAuthenticator(this.application);

    if (this.localValidation) {
      authenticator.withLocalValidation();
    }
  } else if (req.body) {
    token = req.body;

    if (req.body.grant_type === 'password') {
      authenticator = new OAuthPasswordGrantRequestAuthenticator(this.application);
    } else if (req.body.grant_type === 'refresh_token') {
      authenticator = new OAuthRefreshTokenGrantRequestAuthenticator(this.application);
    }
  }

  if (authenticator) {
    authenticator.authenticate(token, callback);
  } else {
    callback(this.unauthenticated());
  }

  return this;
};

OAuthAuthenticator.prototype.unauthenticated = function unauthenticated(){
  return new ApiAuthRequestError({userMessage: 'Unauthorized', statusCode: 401});
};

module.exports = OAuthAuthenticator;
