'use strict';

function OAuthClientCredentialGrantRequestAuthenticator(application) {
  if (!(this instanceof OAuthClientCredentialGrantRequestAuthenticator)) {
    return new OAuthClientCredentialGrantRequestAuthenticator(application);
  }
  this.application = application;
}
OAuthClientCredentialGrantRequestAuthenticator.prototype.authenticate = function authenticate() {
  // TODO
};

module.exports = OAuthClientCredentialGrantRequestAuthenticator;
