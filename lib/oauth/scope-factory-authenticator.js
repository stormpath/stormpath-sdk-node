'use strict';

var njwt = require('njwt');

function ScopeFactoryAuthenticator(application) {
  if (!(this instanceof ScopeFactoryAuthenticator)) {
    return new ScopeFactoryAuthenticator(application);
  }
}

ScopeFactoryAuthenticator.prototype.setScopeFactory = function setAuthenticatorScopeFactory(scopeFactory) {
  this.scopeFactory = scopeFactory;
};

ScopeFactoryAuthenticator.prototype.setScopeFactorySigningKey = function setSigningKey(signingKey) {
  this.signingKey = signingKey;
};

ScopeFactoryAuthenticator.prototype._createAuthResult = function _createAuthenticatorResult(application, formData, responseData, Ctor, callback) {
  var self = this;

  if (typeof this.scopeFactory === 'undefined') {
    return callback(null, new Ctor(application, responseData));
  }

  if (typeof this.signingKey === 'undefined') {
    callback(new Error('Signing key required for expanding the authentication result token through scope factories. Please use `setSigningKey` first'));
  }

  njwt.verify(responseData.access_token, this.signingKey, function(err, token) {
    self.scopeFactory(token, formData.scope, function(err, addedScope) {
      if (err) {
        return callback(err);
      }

      if (addedScope) {
        token.body.scope = addedScope;
      }

      responseData.access_token = njwt.create(token, self.signingKey).compact();

      callback(null, new Ctor(application, responseData));
    });
  });
};

module.exports = ScopeFactoryAuthenticator;
