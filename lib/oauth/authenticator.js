'use strict';

var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var JwtAuthenticator = require('../jwt/jwt-authenticator');
var ScopeFactoryAuthenticator = require('../oauth/scope-factory-authenticator');
var OAuthPasswordGrantRequestAuthenticator = require('../oauth/password-grant').authenticator;
var OAuthRefreshTokenGrantRequestAuthenticator = require('../oauth/refresh-grant').authenticator;
var OAuthIdSiteTokenGrantAuthenticator = require('../oauth/id-site-grant').authenticator;
var OAuthStormpathTokenAuthenticator = require('../oauth/stormpath-token').authenticator;
var OAuthClientCredentialsAuthenticator = require('./client-credentials').authenticator;
var OAuthStormpathSocialAuthenticator = require('../oauth/stormpath-social').authenticator;

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

/**
* @function
*
* @description
*
* Sets a scope factory to be used in the authentication flow, provided the grant
* type supports scopes and scope factories. The scope factory is a
* developer-provided function that allows you to add custom scope to the tokens
* that Stormpath creates.
*
* @param {Function} scopeFactory
* The scope factory to use when processing authentication results. When it is defined,
* it will be invoked with the authentication result.  You should determine which scope
* to grant, and provide it to the callback.
*
* The function must have the signature `(authenticationResult, requestedScope, callback)`.
*
* See
* {@link ScopeFactoryAuthenticator#setScopeFactory ScopeFactoryAuthenticator.setScopeFactory}
* for more details.
*/
OAuthAuthenticator.prototype.setScopeFactory = function setScopeFactory(scopeFactory) {
  this.scopeFactory = scopeFactory;
};

/**
* @function
*
* @description
*
* Sets the signing key used by the scope factory to sign new access tokens.
* Only used in the scope factory flow. See
* {@link ScopeFactoryAuthenticator#setScopeFactorySigningKey ScopeFactoryAuthenticator.setScopeFactorySigningKey}.
*
* @param {String} signingKey
* Signing key used to pack and unpack JWTs. It is <b>required</b> if the scope
* factory is set. If the factory is invoked without a signing key, an error will
* be passed to the callback.
*
* This must be the same Tenant API Key Secret that you used to create the {@link Client}
* that was used to initiate the authentication attempt.
*/
OAuthAuthenticator.prototype.setScopeFactorySigningKey = function setScopeFactorySigningKey(key) {
  this.signingKey = key;
};

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
      case 'client_credentials':
        authenticator = new OAuthClientCredentialsAuthenticator(this.application);
        break;
      case 'stormpath_social':
        authenticator = new OAuthStormpathSocialAuthenticator(this.application);
    }
  }

  if (this.scopeFactory && (authenticator instanceof ScopeFactoryAuthenticator)) {
    authenticator.setScopeFactory(this.scopeFactory);
    authenticator.setScopeFactorySigningKey(this.signingKey);
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
