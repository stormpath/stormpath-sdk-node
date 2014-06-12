var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var jwt = require('jwt-simple');
var utils = require('../utils');
var OauthAuthenticationResult = require('../resource/OauthAuthenticationResult');
var nowEpochSeconds = utils.nowEpochSeconds;

function getJwt(token,secret){
  var jwtObject;
  try{
    jwtObject = jwt.decode(token, secret);
  }
  catch(e){
    return new ApiAuthRequestError('Cannot decode JWT: ' + e.message);
  }
  return jwtObject;
}

function validateJwt(jwtObject){
  var requiredFields = [['timestamp',Number],['expires_in',Number],['client_id',String]];
  for(var i=0,m=requiredFields.length;i<m;i++){
    if(!jwtObject[requiredFields[i][0]]||jwtObject[requiredFields[i][0]].constructor!==requiredFields[i][1]){
      return new ApiAuthRequestError('Missing or invalid jwt parameter: ' + requiredFields[i][0]);
    }
  }
  if(nowEpochSeconds()>(jwtObject.timestamp + jwtObject.expires_in)){
    return new ApiAuthRequestError('Token has expired');
  }
  if(jwtObject.scope && typeof jwtObject.scope !== 'string'){
    return new ApiAuthRequestError('scope must be a string');
  }
  return null;
}


function OauthAccessTokenAuthenticator(application,token,callback){
  var jwtObject = getJwt(token,application.dataStore.requestExecutor.options.apiKey.secret);

  if(jwtObject instanceof Error){
    return callback(jwtObject);
  }
  var jwtValidationResult = validateJwt(jwtObject);
  if(jwtValidationResult instanceof Error){
    return callback(jwtValidationResult);
  }

  var scopes;
  if(jwtObject.scope){
    scopes = jwtObject.scope.split(' ');
  }else{
    scopes = [];
  }
  var apiKey = jwtObject.client_id;
  application.getApiKey(apiKey,function(err,apiKey){
    if(err){
      callback(err);
    }else if(apiKey.status === 'DISABLED'){
      callback(new ApiAuthRequestError('Invalid Client Id'));
    }else{
      var data = apiKey;
      data.token = token;
      data.jwtObject = jwtObject;
      if(scopes){
        data.requestedScopes = scopes;
      }

      callback(null,new OauthAuthenticationResult(apiKey,application.dataStore));
    }
  });
}

module.exports = OauthAccessTokenAuthenticator;