'use strict';

var util = require('util');
var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');

function OAuthStormpathTokenAuthenticationResult(application, data){
  OAuthStormpathTokenAuthenticationResult.super_.apply(this, arguments);
  this.accessTokenResponse = data;
}
util.inherits(OAuthStormpathTokenAuthenticationResult, JwtAuthenticationResult);

function OAuthStormpathTokenAuthenticator(application) {
  if (!(this instanceof OAuthStormpathTokenAuthenticator)) {
    return new OAuthStormpathTokenAuthenticator(application);
  }

  this.application = application;
}

OAuthStormpathTokenAuthenticator.prototype.authenticate = function authenticate(data, callback) {
  var application = this.application;

  if (typeof data !== 'object') {
    throw new Error('The \'data\' parameter must be an object.');
  }

  if (typeof callback !== 'function') {
    throw new Error('The \'callback\' parameter must be a function.');
  }

  var formData = {
    grant_type: 'stormpath_token',
    token: data.stormpath_token
  };

  var tokenHref = application.href + '/oauth/token';

  application.dataStore.createResource(tokenHref, { form: formData }, function(err, tokenData) {
    if (err) {
      return callback(err);
    }

    callback(null, new OAuthStormpathTokenAuthenticationResult(application, tokenData));
  });
};

module.exports = {
  authenticator: OAuthStormpathTokenAuthenticator,
  authenticationResult: OAuthStormpathTokenAuthenticationResult
};
