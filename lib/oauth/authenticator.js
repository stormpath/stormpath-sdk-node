'use strict';

var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var JwtAuthenticator = require('../jwt/jwt-authenticator');
var OAuthPasswordGrantRequestAuthenticator = require('../oauth/password-grant').authenticator;
var OAuthRefreshTokenGrantRequestAuthenticator = require('../oauth/refresh-grant').authenticator;
var OAuthIdSiteTokenGrantAuthenticator = require('../oauth/id-site-grant').authenticator;
var OAuthStormpathTokenAuthenticator = require('../oauth/stormpath-token').authenticator;

function retrieveAuthTokenFromRequest(req) {
  var authHeader = req && req.headers && req.headers.authorization;

  if (!authHeader || !authHeader.match(/Bearer/i)) {
    return false;
  }

  return authHeader.split(' ').pop();
}

/**
 * Intentionally not documented for the time being.  This is essentially middleware
 * for Express, so I'm not sure it belongs in this library.
 *
 * @private
 */
function OAuthAuthenticator(application) {
  if (!(this instanceof OAuthAuthenticator)) {
    return new OAuthAuthenticator(application);
  }

  this.application = application;
}

OAuthAuthenticator.prototype.localValidation = false;

OAuthAuthenticator.prototype.withLocalValidation = function withLocalValidation() {
  this.localValidation = true;
  return this;
};

OAuthAuthenticator.prototype.authenticate = function authenticate(req, callback){
  if (typeof req !== 'object' || typeof callback !== 'function') {
    throw new Error('authenticate must be called with a request object and callback function');
  }

  var authenticator = null;
  var token = retrieveAuthTokenFromRequest(req);

  if (token) {
    authenticator = new JwtAuthenticator(this.application);

    if (this.localValidation) {
      authenticator.withLocalValidation();
    }
  } else if (req.body) {
    token = req.body;
    switch (req.body.grant_type) {
      case 'password':
        authenticator = new OAuthPasswordGrantRequestAuthenticator(this.application);
        break;
      case 'refresh_token':
        authenticator = new OAuthRefreshTokenGrantRequestAuthenticator(this.application);
        break;
      case 'id_site_token':
        authenticator = new OAuthIdSiteTokenGrantAuthenticator(this.application);
        break;
      case 'stormpath_token':
        authenticator = new OAuthStormpathTokenAuthenticator(this.application);
        break;
    }
  }

  if (authenticator) {
    authenticator.authenticate(token, callback);
  } else {
    callback(this.unauthenticated());
  }

  return this;
};

OAuthAuthenticator.prototype.unauthenticated = function unauthenticated(){
  return new ApiAuthRequestError({userMessage: 'Unauthorized', statusCode: 401});
};

module.exports = OAuthAuthenticator;
