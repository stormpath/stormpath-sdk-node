'use strict';

var passwordGrant = require('./oauth/password-grant');
var refreshGrant = require('./oauth/refresh-grant');

module.exports = {
  ApiKey: require('./authc/ApiKey'),
  loadApiKey: require('./authc/ApiKeyLoader'),
  configLoader: require('./configLoader'),
  Client: require('./Client'),
  Tenant: require('./resource/Tenant'),
  OAuthPasswordGrantRequestAuthenticator: passwordGrant.authenticator,
  OauthPasswordGrantAuthenticationResult: passwordGrant.authenticationResult,
  OAuthRefreshTokenGrantRequestAuthenticator: refreshGrant.authenticator,
  JwtAuthenticator: require('./jwt/jwt-authenticator'),
  OAuthAuthenticator: require('./oauth/authenticator')
};