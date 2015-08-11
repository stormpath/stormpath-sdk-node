'use strict';

var passwordGrant = require('./oauth/password-grant');

module.exports = {
  ApiKey: require('./authc/ApiKey'),
  loadApiKey: require('./authc/ApiKeyLoader'),
  Client: require('./Client'),
  Tenant: require('./resource/Tenant'),
  OAuthPasswordGrantRequestAuthenticator: passwordGrant.authenticator,
  OauthPasswordGrantAuthenticationResult: passwordGrant.authenticationResult,
  OAuthAuthenticator: require('./oauth/authenticator')
};