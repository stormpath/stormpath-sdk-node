'use strict';

var passwordGrant = require('./oauth/password-grant');
var refreshGrant = require('./oauth/refresh-grant');
var idSiteGrant = require('./oauth/id-site-grant');
var stormpathToken = require('./oauth/stormpath-token');

module.exports = {
  ApiKey: require('./authc/ApiKey'),
  loadApiKey: require('./authc/ApiKeyLoader'),
  configLoader: require('./configLoader'),
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
