'use strict';

var njwt = require('njwt');

var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var JwtAuthenticationResult = require('./jwt-authentication-result');

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

JwtAuthenticator.prototype.unauthenticated = function unauthenticated(){
  return new ApiAuthRequestError({userMessage:'Unauthorized', statusCode: 401});
};

JwtAuthenticator.prototype.authenticate = function authenticate(token,cb){
  var self = this;

  var secret = self.application.dataStore.requestExecutor.options.client.apiKey.secret;

  njwt.verify(token,secret,function(err,jwt){
    if(err){
      err.statusCode = 401;
      cb(err);
    }else{
      if(self.localValidation){
        cb(null, new JwtAuthenticationResult(self.application,{
          jwt: token,
          expandedJwt: jwt,
          localValidation: true
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
        throw new Error('not yet implemented - please use application.authenticateApiRequest() instead');
      }
    }
  });

  return this;
};

module.exports = JwtAuthenticator;
