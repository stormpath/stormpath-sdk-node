var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var OauthAccessTokenResult = require('../resource/OauthAccessTokenResult');

function OAuthBasicExchangeAuthenticator(application,request){
  var authValue = request.headers.authorization.replace(/Basic /i,'');
  var parts = new Buffer(authValue,'base64').toString('utf8').split(':');

  if(parts.length!==2){
    return new ApiAuthRequestError('Invalid Authorization value');
  }
  this.id = parts[0];
  this.secret = parts[1];
  this.application = application;

}

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
        var result = new OauthAccessTokenResult(apiKey,self.application.dataStore);
        result.setApplicationHref(self.application.href);
        callback(null,result);
      }else{
        callback(new ApiAuthRequestError('Invalid Credentials'));
      }
    }
  });
};

module.exports = OAuthBasicExchangeAuthenticator;