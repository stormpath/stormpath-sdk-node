'use strict';

module.exports = {
  ApiKey: require('./authc/ApiKey'),
  loadApiKey: require('./authc/ApiKeyLoader'),
  Client: require('./Client'),
  Tenant: require('./resource/Tenant'),
  OAuthPasswordGrantRequestAuthenticator: require('./oauth/password-grant').authenticator,
  OAuthAuthenticator: require('./oauth/authenticator')
};