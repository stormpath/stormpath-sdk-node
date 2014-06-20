var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var AuthenticationResult = require('../resource/AuthenticationResult');

function BasicApiAuthenticator(application,authHeaderValue){
  var parts = new Buffer(authHeaderValue.replace(/Basic /i,''),'base64').toString('utf8').split(':');
  if(parts.length!==2){
    return new ApiAuthRequestError('Invalid Authorization value');
  }
  this.application = application;
  this.id = parts[0];
  this.secret = parts[1];
}

BasicApiAuthenticator.prototype.authenticate = function authenticate(callback) {
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
        callback(null,new AuthenticationResult(apiKey,self.application.dataStore));
      }else{
        callback(new ApiAuthRequestError('Invalid Credentials'));
      }
    }
  });
};

module.exports = BasicApiAuthenticator;