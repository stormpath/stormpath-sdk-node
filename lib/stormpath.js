'use strict';

var passwordGrant = require('./oauth/password-grant');
var refreshGrant = require('./oauth/refresh-grant');
var idSiteGrant = require('./oauth/id-site-grant');
var stormpathToken = require('./oauth/stormpath-token');

/**
 * @module stormpath
 *
 * @description
 *
 * This is the Stormpath module, you must require this in your
 * application if you wish to use the Stormpth Node SDK.
 *
 * @example
 *
 * var stormpath = require('stormpath');
 */
module.exports = {
  ApiKey: require('./authc/ApiKey'),
  loadApiKey: require('./authc/ApiKeyLoader'),
  configLoader: require('./configLoader'),
  /**
  * @description
  *
  * Create a new client instance.
  *
  * @example
  *
  * var client = new stormpath.Client();
  */
  Client: require('./Client'),
  Tenant: require('./resource/Tenant'),
  OAuthPasswordGrantRequestAuthenticator: passwordGrant.authenticator,
  OauthPasswordGrantAuthenticationResult: passwordGrant.authenticationResult,
  OAuthRefreshTokenGrantRequestAuthenticator: refreshGrant.authenticator,
  OAuthIdSiteTokenGrantAuthenticator: idSiteGrant.authenticator,
  OAuthIdSiteTokenGrantAuthenticationResult: idSiteGrant.authenticationResult,
  OAuthStormpathTokenAuthenticator: stormpathToken.authenticator,
  OAuthStormpathTokenAuthenticationResult: stormpathToken.authenticationResult,
  SamlIdpUrlBuilder: require('./saml/SamlIdpUrlBuilder'),
  AssertionAuthenticationResult: require('./authc/AssertionAuthenticationResult'),
  StormpathAssertionAuthenticator: require('./authc/StormpathAssertionAuthenticator'),
  JwtAuthenticator: require('./jwt/jwt-authenticator'),
  OAuthAuthenticator: require('./oauth/authenticator')
};
