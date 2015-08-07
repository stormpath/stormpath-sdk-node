'use strict';

function OAuthPasswordGrantRequestAuthenticator(application) {
  if (!(this instanceof OAuthPasswordGrantRequestAuthenticator)) {
    return new OAuthPasswordGrantRequestAuthenticator(application);
  }
  this.application = application;
  return this;
}
OAuthPasswordGrantRequestAuthenticator.prototype.authenticate = function authenticate(data,callback) {
  if(!data){
    throw new Error('Must suppply data body to authenticate()');
  }else{
    var href = this.application.href + '/oauth/token';
    data.grant_type='password';
    this.application.dataStore.createResource(href,{form:data},callback);
  }
};

module.exports = OAuthPasswordGrantRequestAuthenticator;