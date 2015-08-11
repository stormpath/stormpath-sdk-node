'use strict';

var nJwt = require('nJwt');

function OAuthAuthenticationResult(application,data) {
  if (!(this instanceof OAuthAuthenticationResult)) {
    return new OAuthAuthenticationResult(application);
  }else{
    this.application = application;
    /*
      Take all the properties of the data response, and put them
      on this object - but convert underscores to camelcase cuz
      that's the node way bro
     */
    Object.keys(data).reduce(function(a,key){
      var newKey = key.replace(/_([A-Za-z])/g, function (g) { return g[1].toUpperCase(); });
      a[newKey] = data[key];
      return a;
    },this);
    if(this.accessToken){
      this.accessToken = nJwt.verify(this.accessToken,application.dataStore.requestExecutor.options.apiKey.secret);
    }
    if(this.refreshToken){
      this.refreshToken = nJwt.verify(this.refreshToken,application.dataStore.requestExecutor.options.apiKey.secret);
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