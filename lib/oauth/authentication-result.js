'use strict';

var nJwt = require('nJwt');

function OAuthAuthenticationResult(application,data) {
  if (!(this instanceof OAuthAuthenticationResult)) {
    return new OAuthAuthenticationResult(application,data);
  }else{

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

    /*
      Assign application after the key reduction above,
      otherwise it will get replaced with the objet literal
      from the response data
     */

    this.application = application;

    if(this.accessToken){
      this.accessToken = nJwt.verify(this.accessToken,application.dataStore.requestExecutor.options.apiKey.secret);
      this.account = {
        href: this.accessToken.body.sub
      };
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
  // workaround because I don't have access to a stormpath client
  this.application.dataStore.getResource(this.account.href, require('../resource/Account'), callback);
};

module.exports = OAuthAuthenticationResult;