var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var OauthAccessTokenResult = require('../resource/OauthAccessTokenResult');

function OAuthBasicExchangeAuthenticator(application,request,callback){
  var authValue = request.headers.authorization.replace(/Basic /i,'');
  var parts = new Buffer(authValue,'base64').toString('utf8').split(':');

  if(parts.length!==2){
    return callback(new ApiAuthRequestError('Invalid Authorization value'));
  }
  var id = parts[0];
  var secret = parts[1];
  application.getApiKey(id,function(err,apiKey){
    if(err){
      callback(err);
    }else{
      if(apiKey.secret===secret && apiKey.status==='ENABLED'){
        callback(null,new OauthAccessTokenResult(apiKey,application.dataStore));
      }else{
        callback(new ApiAuthRequestError('Invalid Credentials'));
      }
    }
  });
}

module.exports = OAuthBasicExchangeAuthenticator;