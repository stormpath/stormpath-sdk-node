var utils = require('../utils');
var jwt = require('jwt-simple');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var AuthenticationResult = require('../resource/AuthenticationResult');

var nowEpochSeconds = utils.nowEpochSeconds;

function OAuthBasicExchangeAuthenticator(application,request,ttl,scopeFactory, requestedScope){
  var authValue = request.headers.authorization.replace(/Basic /i,'');
  var parts = new Buffer(authValue,'base64').toString('utf8').split(':');

  if(parts.length!==2){
    return new ApiAuthRequestError('Invalid Authorization value');
  }
  this.id = parts[0];
  this.secret = parts[1];
  this.application = application;
  this.ttl = ttl || 3600;
  this.scopeFactory = scopeFactory || this.defaultScopeFactory;
  this.requestedScope = requestedScope;
}

OAuthBasicExchangeAuthenticator.prototype.defaultScopeFactory = function() {
  return '';
};

OAuthBasicExchangeAuthenticator.prototype.authenticate = function authenticate(callback) {
  var self = this;
  self.application.getApiKey(self.id,function(err,apiKey){
    if(err){
      callback(err);
    }else{
      if(
        (apiKey.secret===self.secret) &&
        (apiKey.status==='ENABLED') &&
        (apiKey.account.status==='ENABLED')
      ){
        var result = new AuthenticationResult(apiKey,self.application.dataStore);
        result.tokenResponse = self.buildTokenResponse(apiKey);
        callback(null,result);
      }else{
        callback(new ApiAuthRequestError('Invalid Credentials'));
      }
    }
  });
};

OAuthBasicExchangeAuthenticator.prototype.buildTokenResponse = function buildTokenResponse(apiKey) {
  var self = this;
  return {
    "access_token": self.buildAccesstoken(apiKey.account),
    "token_type":"bearer",
    "expires_in": self.ttl
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
    _jwt.scope = scope;
  }
  return self._token = jwt.encode(_jwt,self.application.dataStore.requestExecutor.options.apiKey.secret,'HS256');
};

module.exports = OAuthBasicExchangeAuthenticator;