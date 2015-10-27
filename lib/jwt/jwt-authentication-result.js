'use strict';

var nJwt = require('njwt');

function JwtAuthenticationResult(application,data) {
  if (!(this instanceof JwtAuthenticationResult)) {
    return new JwtAuthenticationResult(application,data);
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
    var apiKey = application.dataStore.requestExecutor.options.client.apiKey;

    if(this.accessToken){
      this.accessToken = nJwt.verify(this.accessToken, apiKey.secret);
      this.account = {
        href: this.accessToken.body.sub
      };
    }
    if(this.refreshToken){
      this.refreshToken = nJwt.verify(this.refreshToken, apiKey.secret);
    }

    return this;
  }
}

JwtAuthenticationResult.prototype.account = null;

JwtAuthenticationResult.prototype.jwt = null;

JwtAuthenticationResult.prototype.expandedJwt = null;

JwtAuthenticationResult.prototype.getAccount = function getAccount(callback) {
  // workaround because I don't have access to a stormpath client
  this.application.dataStore.getResource(this.account.href, require('../resource/Account'), callback);
};

module.exports = JwtAuthenticationResult;
