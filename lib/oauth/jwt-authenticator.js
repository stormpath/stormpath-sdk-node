'use strict';

var njwt = require('njwt');

var ApiAuthRequestError = require('../error/ApiAuthRequestError');

var JwtAuthenticationResult = require('./jwt-authentication-result');

var OAuthRefreshTokenGrantRequestAuthenticator = require('./refresh-grant').authenticator;

var OAuthPasswordGrantRequestAuthenticator = require('./password-grant').authenticator;

function JwtAuthenticator(application) {
  if (!(this instanceof JwtAuthenticator)) {
    return new JwtAuthenticator(application);
  }else{
    this.application = application;
    return this;
  }
}

JwtAuthenticator.prototype.defaultCookieName = 'access_token';

JwtAuthenticator.prototype.localValidation = false;

JwtAuthenticator.prototype.withLocalValidation = function withLocalValidation() {
  this.localValidation = true;
  return this;
};

JwtAuthenticator.prototype.withCookie = function withCookie(cookieName){
  this.configuredCookieName = cookieName;
  return this;
};

JwtAuthenticator.prototype.authenticate = function authenticate(req,callback){
  var self = this;
  var done;
  if(typeof req==='object' && typeof callback === 'function'){
    done = callback;
  }else{
    throw new Error('authenticate must be called with a request object and callback function');
  }
  var authHeader = req && req.headers && req.headers.authorization;
  var cookieValue = req && req.cookies && req.cookies[this.configuredCookieName || this.defaultCookieName];
  if (authHeader){
    if(authHeader.match(/Bearer/i)){
      var parts = authHeader.split(' ');
      var token = parts[parts.length-1];
      self.authenticateAccessToken(token,done);
    }else{
      done(self.unauthenticated());
    }
  }else if (cookieValue){
    self.authenticateAccessToken(cookieValue,done);
  }else if (req.body && req.body.grant_type==='password'){
    new OAuthPasswordGrantRequestAuthenticator(self.application).authenticate(req.body,callback);
  }else if (req.body && req.body.grant_type==='refresh_token'){
    new OAuthRefreshTokenGrantRequestAuthenticator(self.application).authenticate(req.body,callback);
  }else{
    done(self.unauthenticated());
  }
  return this;
};

JwtAuthenticator.prototype.unauthenticated = function unauthenticated(){
  return new ApiAuthRequestError('Unauthorized', 401);
};

JwtAuthenticator.prototype.authenticateAccessToken = function authenticateAccessToken(token,cb){
  var self = this;

  var secret = self.application.dataStore.requestExecutor.options.apiKey.secret;

  njwt.verify(token,secret,function(err,jwt){
    if(err){
      err.statusCode = 401;
      cb(err);
    }else{
      if(self.localValidation){
        cb(null, new JwtAuthenticationResult(self.application,{
          jwt: token,
          expandedJwt: jwt
        }));
      }else if(jwt.header.kid){
        // If the KID exists, this was issued by our API
        var href = self.application.href + '/authTokens/' + token;
        self.application.dataStore.getResource(href,function(err,response){
          if(err){
            cb(err);
          }else{
            cb(null, new JwtAuthenticationResult(self.application,response));
          }
        });
      }else{

        // If there is no KID, this means it was
        // issued by the SDK (not the API) so we have
        // to do remote validation in a different way
        console.log('HERE');
      }
    }
  });

  return this;
};

module.exports = JwtAuthenticator;