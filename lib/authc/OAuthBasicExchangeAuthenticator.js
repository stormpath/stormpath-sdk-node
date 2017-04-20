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

OAuthBasicExchangeAuthenticator.prototype.defaultScopeFactory = function defaultScopeFactory(account, requestedScope, callback) {
  callback(null, '');
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
        result.ttl = self.ttl;

        self.buildTokenResponse(apiKey, function onTokenResponse(err, tokenResponse) {
          if (err) {
            callback(err);
            return;
          }

          result.tokenResponse = tokenResponse;

          callback(null, result);
        });
      }else{
        callback(new ApiAuthRequestError({userMessage: 'Invalid Client Credentials', error: 'invalid_client', statusCode: 401}));
      }
    }
  });
};

OAuthBasicExchangeAuthenticator.prototype.buildTokenResponse = function buildTokenResponse(apiKey, callback) {
  var self = this;

  var account = apiKey.account;
  var requestedScope = self.requestedScope;

  function retrieveScopeFactoryResult(callback) {
    var hasBeenCalled = false;

    function callbackWithResult(err, scope) {
      if (hasBeenCalled) {
        throw new Error('Callback has already been called once. Assert that your scopeFactory doesn\'t return a result while also calling the callback.');
      }

      hasBeenCalled = true;

      callback(err, scope);
    }

    var optionalResult = self.scopeFactory(account, requestedScope, callbackWithResult);

    // For backward-compatibility: If we have a result then call the callback immediately,
    // else expect it to be handled by the scopeFactory function.
    if (optionalResult || optionalResult === '') {
      callbackWithResult(null, optionalResult);
    }
  }

  retrieveScopeFactoryResult(function onScopeResolved(err, scopeResult) {
    if (err) {
      callback(err);
      return;
    }

    // TODO v1.0.0 - remove array option for tokens, should be string
    callback(null, {
      access_token: self.buildAccessToken(account, scopeResult),
      token_type: 'bearer',
      expires_in: self.ttl,
      scope: Array.isArray(scopeResult) ? scopeResult.join(' ') : scopeResult
    });
  });
};

OAuthBasicExchangeAuthenticator.prototype.buildAccessToken = function buildAccessToken(account, scope) {
  var now = nowEpochSeconds();

  var _jwt = {
    sub: this.id,
    iss: this.application.href,
    iat: now,
    exp: now + this.ttl
  };

  if(scope){
    // TODO v1.0.0 - remove string option, should be array only
    _jwt.scope = Array.isArray(scope) ? scope.join(' ') : scope;
  }

  var options = this.application.dataStore.requestExecutor.options;

  var secret = options.client.apiKey.secret || options.apiToken;

  return this._token = jwt.encode(_jwt, secret, 'HS256');
};

module.exports = OAuthBasicExchangeAuthenticator;
