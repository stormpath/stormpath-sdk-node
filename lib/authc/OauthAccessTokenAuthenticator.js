var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var jwt = require('jwt-simple');
var utils = require('../utils');
var AuthenticationResult = require('../resource/AuthenticationResult');
var nowEpochSeconds = utils.nowEpochSeconds;

function getJwt(token,secret){
  var jwtObject;
  try{
    jwtObject = jwt.decode(token, secret);
  }
  catch(e){
    return new ApiAuthRequestError('access_token is invalid',401);
  }
  return jwtObject;
}

function validateJwt(jwtObject){
  var requiredFields = [['iat',Number],['exp',Number],['sub',String]];
  for(var i=0,m=requiredFields.length;i<m;i++){
    if(!jwtObject[requiredFields[i][0]]||jwtObject[requiredFields[i][0]].constructor!==requiredFields[i][1]){
      return new ApiAuthRequestError('Missing or invalid jwt parameter: ' + requiredFields[i][0]);
    }
  }
  if(nowEpochSeconds()>jwtObject.exp){
    return new ApiAuthRequestError('Token has expired', 401);
  }
  if(jwtObject.scope && typeof jwtObject.scope !== 'string'){
    return new ApiAuthRequestError('scope must be a string');
  }
  return null;
}


function OauthAccessTokenAuthenticator(application,token){
  var jwtObject = getJwt(token,application.dataStore.requestExecutor.options.apiKey.secret);

  if(jwtObject instanceof Error){
    return jwtObject;
  }
  var jwtValidationResult = validateJwt(jwtObject);
  if(jwtValidationResult instanceof Error){
    return jwtValidationResult;
  }

  var scopes;
  if(jwtObject.scope){
    scopes = jwtObject.scope.split(' ');
  }else{
    scopes = [];
  }
  this.scopes = scopes;
  this.apiKey = jwtObject.sub;
  this.application = application;
  this.token = token;
  this.jwtObject = jwtObject;
}

OauthAccessTokenAuthenticator.prototype.authenticate = function authenticate(callback) {
  var self = this;
  var subject = this.jwtObject.sub;
  if(subject.match(/accounts/)){
    self.application.dataStore.getResource(subject,null,require('../resource/Account'),function(err,account){
      if(err){
        callback(err.status===404 ? new ApiAuthRequestError('Invalid Client Credentials', 401) : err);
      }else if(account.status==='ENABLED'){
        var data = {
          token: self.token,
          jwtObject: self.jwtObject,
          account: account
        };

        if(self.scopes){
          data.grantedScopes = self.scopes;
        }

        callback(null,new AuthenticationResult(data,self.application.dataStore));
      }else{
        callback(new ApiAuthRequestError('Invalid Client Credentials', 401));
      }
    });
  }else{
    self.application.getApiKey(self.apiKey,function(err,apiKey){
      if(err){
        callback(err.status===404 ? new ApiAuthRequestError('Invalid Client Credentials', 401) : err);
      }else if(
        (apiKey.status==='ENABLED') &&
        (apiKey.account.status==='ENABLED')
      ){
        var data = apiKey;
        data.token = self.token;
        data.jwtObject = self.jwtObject;
        if(self.scopes){
          data.grantedScopes = self.scopes;
        }

        callback(null,new AuthenticationResult(apiKey,self.application.dataStore));
      }else{
        callback(new ApiAuthRequestError('Invalid Client Credentials', 401));
      }
    });
  }
};

module.exports = OauthAccessTokenAuthenticator;