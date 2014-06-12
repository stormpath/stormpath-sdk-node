var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var AuthenticationResult = require('../resource/AuthenticationResult');

function BasicApiAuthenticator(application,authHeaderValue,callback){
  var parts = new Buffer(authHeaderValue.replace(/Basic /i,''),'base64').toString('utf8').split(':');
  if(parts.length!==2){
    return callback(new ApiAuthRequestError('Invalid Authorization value'));
  }
  var id = parts[0];
  var secret = parts[1];
  application.getApiKey(id,function(err,apiKey){
    if(err){
      callback(err);
    }else{
      if(apiKey.secret===secret){
        callback(null,new AuthenticationResult(apiKey,application.dataStore));
      }else{
        callback(new ApiAuthRequestError('Invalid Credentials'));
      }
    }
  });
}

module.exports = BasicApiAuthenticator;