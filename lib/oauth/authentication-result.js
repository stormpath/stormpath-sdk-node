'use strict';

var _ = require('underscore');

function OAuthAuthenticationResult(application,data) {
  if (!(this instanceof OAuthAuthenticationResult)) {
    return new OAuthAuthenticationResult(application);
  }else{
    this.application = application;
    if(data){
      _.extend(this,data);
    }
    return this;
  }
}

OAuthAuthenticationResult.prototype.account = null;

OAuthAuthenticationResult.prototype.jwt = null;

OAuthAuthenticationResult.prototype.expandedJwt = null;

OAuthAuthenticationResult.prototype.getAccount = function getAccount(callback) {
  this.application.getAccount(this.account.href,callback);
};

module.exports = OAuthAuthenticationResult;