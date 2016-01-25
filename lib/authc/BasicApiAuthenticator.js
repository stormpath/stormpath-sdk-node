'use strict';

var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var AuthenticationResult = require('../resource/AuthenticationResult');

function BasicApiAuthenticator(application,authHeaderValue, ttl){
  var parts = new Buffer(authHeaderValue.replace(/Basic /i,''),'base64').toString('utf8').split(':');

  if(parts.length !== 2){
    return new ApiAuthRequestError({userMessage: 'Invalid Authorization value', statusCode: 400});
  }

  this.application = application;
  this.id = parts[0];
  this.secret = parts[1];

  this.ttl = ttl || 3600;
}

BasicApiAuthenticator.prototype.authenticate = function authenticate(callback) {
  var self = this;

  self.application.getApiKey(self.id,function(err,apiKey){
    if(err){
      callback(err.status===404 ? new ApiAuthRequestError({userMessage: 'Invalid Client Credentials', error: 'invalid_client',  statusCode: 401}) : err);
    }else{
      if(
        (apiKey.secret===self.secret) &&
        (apiKey.status==='ENABLED') &&
        (apiKey.account.status==='ENABLED')
      ){
        var authenticationResult = new AuthenticationResult(apiKey,self.application.dataStore);

        authenticationResult.application = self.application;
        authenticationResult.ttl = self.ttl;

        callback(null,authenticationResult);
      }else{
        callback(new ApiAuthRequestError({userMessage: 'Invalid Client Credentials', error: 'invalid_client',  statusCode: 401}));
      }
    }
  });
};

module.exports = BasicApiAuthenticator;
