'use strict';

var jwt = require('jwt-simple');

var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var AuthenticationResult = require('../resource/AuthenticationResult');
var utils = require('../utils');

var nowEpochSeconds = utils.nowEpochSeconds;

function OAuthBasicExchangeAuthenticator(application,request,ttl,scopeFactory, requestedScope){
  var authValue = request.headers.authorization.replace(/Basic /i,'');
  var parts = new Buffer(authValue,'base64').toString('utf8').split(':');

  if(parts.length!==2){
    return new ApiAuthRequestError({userMessage: 'Invalid Authorization value', statusCode: 400});
  }
  if(request.method!=='POST'){
    return new ApiAuthRequestError({userMessage: 'Must use POST for token exchange, see http://tools.ietf.org/html/rfc6749#section-3.2'});
  }
  this.id = parts[0];
  this.secret = parts[1];
  this.application = application;
  this.ttl = ttl || 3600;
  this.scopeFactory = scopeFactory || this.defaultScopeFactory;
  this.requestedScope = requestedScope;
}

OAuthBasicExchangeAuthenticator.prototype.defaultScopeFactory = function defaultScopeFactory() {
  return '';
};

OAuthBasicExchangeAuthenticator.prototype.authenticate = function authenticate(callback) {
  var self = this;
  self.application.getApiKey(self.id,function(err,apiKey){
    if(err){
      callback(err.status===404 ? new ApiAuthRequestError({userMessage: 'Invalid Client Credentials', error: 'invalid_client', statusCode: 401}) : err);
    }else{
      if(
        (apiKey.secret===self.secret) &&
        (apiKey.status==='ENABLED') &&
        (apiKey.account.status==='ENABLED')
      ){
        var result = new AuthenticationResult(apiKey,self.application.dataStore);
        result.forApiKey = apiKey;
        result.application = self.application;
        result.tokenResponse = self.buildTokenResponse(apiKey);
        callback(null,result);
      }else{
        callback(new ApiAuthRequestError({userMessage: 'Invalid Client Credentials', error: 'invalid_client', statusCode: 401}));
      }
    }
  });
};

OAuthBasicExchangeAuthenticator.prototype.buildTokenResponse = function buildTokenResponse(apiKey) {
  var self = this;
  var scope = self.scopeFactory(apiKey.account,self.requestedScope);
  // TODO v1.0.0 - remove string option for tokens, should be array only
  return {
    "access_token": self.buildAccesstoken(apiKey.account),
    "token_type":"bearer",
    "expires_in": self.ttl,
    "scope": Array.isArray(scope) ? scope.join(' ') : scope
  };
};

OAuthBasicExchangeAuthenticator.prototype.buildAccesstoken = function buildAccesstoken(account) {
  var self = this;
  var now = nowEpochSeconds();

  var _jwt = {
    sub: self.id,
    iss: self.application.href,
    iat: now,
    exp: now + self.ttl
  };

  var scope = self.scopeFactory(account,self.requestedScope);

  if(scope){
    // TODO v1.0.0 - remove string option, should be array only
    _jwt.scope = Array.isArray(scope) ? scope.join(' ') : scope;
  }

  return self._token = jwt.encode(_jwt, self.application.dataStore.requestExecutor.options.client.apiKey.secret, 'HS256');
};

module.exports = OAuthBasicExchangeAuthenticator;
