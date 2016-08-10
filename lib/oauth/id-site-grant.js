'use strict';

var util = require('util');
var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');

function OAuthIdSiteTokenGrantAuthenticationResult(application, data){
  OAuthIdSiteTokenGrantAuthenticationResult.super_.apply(this, arguments);
  this.accessTokenResponse = data;
}
util.inherits(OAuthIdSiteTokenGrantAuthenticationResult, JwtAuthenticationResult);

/**
 * Deprecated, replaced by OAuthStormpathTokenAuthenticator.  Will be removed in 1.0.
 *
 * @private
 */
function OAuthIdSiteTokenGrantAuthenticator(application) {
  if (!(this instanceof OAuthIdSiteTokenGrantAuthenticator)) {
    return new OAuthIdSiteTokenGrantAuthenticator(application);
  }

  this.application = application;
}

OAuthIdSiteTokenGrantAuthenticator.prototype.authenticate = util.deprecate(function authenticate(data, callback) {
  var application = this.application;

  var formData = {
    grant_type: 'id_site_token',
    token: data.id_site_token
  };

  var tokenHref = application.href + '/oauth/token';

  application.dataStore.createResource(tokenHref, { form: formData }, function(err, tokenData) {
    if (err) {
      return callback(err);
    }

    callback(null, new OAuthIdSiteTokenGrantAuthenticationResult(application, tokenData));
  });
},'OAuthIdSiteTokenGrantAuthenticator is deprecated. Use OAuthStormpathTokenAuthenticator instead.  See http://docs.stormpath.com/nodejs/api/oauthStormpathTokenAuthenticator');

module.exports = {
  authenticator: OAuthIdSiteTokenGrantAuthenticator,
  authenticationResult: OAuthIdSiteTokenGrantAuthenticationResult
};
