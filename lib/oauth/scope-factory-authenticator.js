'use strict';

var njwt = require('njwt');

/**
* @class
*
* @description
* Encapsulates the behaviour required by OAuth authenticator classes which allow
* for adding scope to requests.
*
* This class allows you to use scope factory functions to attach scope to JWT objects,
* thus expanding the result and permitting runtime access control checks, searching,
* etc.
*
* This class should not be constructed manually. Instead, OAuth authenticators should
* inherit it and use {@link ScopeFactoryAuthenticator#scopeAuthResult `ScopeFactoryAuthenticator.scopeAuthResult()`}
* in their authenticate methods.
*
* @example
* function groupScopeFactory(authenticationResult, requestedScope, callback) {
*   authenticationResult.getAccount({expand: 'groups'}, function(err, account) {
*     if (err) {
*       return callback(err);
*     }
*
*     var grantedScope = account.groups.items.map(function(group) {
*       return group.name;
*     }).join(' ');
*
*     callback(null, grantedScope);
*   });
* }
*
* var auth = new OAuthStormpathTokenAuthenticator(application);
* auth.setScopeFactory(groupScopeFactory);
* auth.setSigningKey(secretKey);
*
* auth.authenticate({stormpath_token: token, scope: 'admin'}, callback);
*/
function ScopeFactoryAuthenticator() {}

/**
* @function
*
* @description
* Sets the scope factory to be used when parsing tokens.
*
* @param {Function} scopeFactory
* The scope factory to use when processing authentication results. When it is defined,
* and the user has added a `scope` field to their request payload, it will be invoked
* to process the result.
*
* The function must have the signature (authenticationResult, requestedScope, callback).
*
* `authenticationResult` is the result returned from the API when calling `authenticator.authenticate()`,
* and is passed in its entirety, before being processed.
*
* `requestedScope` is the scope the end-user has requested (added to the payload) when authenticating.
* The function is expected to return a string. If the string is non-empty it will be attached to the
* resulting JWT's body.
*
* The callback will be invoked with (err, resultInstance)
*/
ScopeFactoryAuthenticator.prototype.setScopeFactory = function setAuthenticatorScopeFactory(scopeFactory) {
  this.scopeFactory = scopeFactory;
};

/**
* @function
*
* @description
* Sets the signing key used when unpacking and packing JWTs to modify the scope
* parameter.
*
* @param {String} signingKey
* Signing key used to pack and unpack JWTs. It is <b>required</b> if the scope
* factory is set. If the factory is invoked without a signing key, an error will
* be passed to the callback.
*/
ScopeFactoryAuthenticator.prototype.setScopeFactorySigningKey = function setSigningKey(signingKey) {
  this.signingKey = signingKey;
};

/**
* @function
*
* @private
*
* @description
* Constructs results from OAuth authentication responses, optionally adding scope parameters
* to these results. Determines whether scope should be added and validates the parameters.
*
* The function is to be invoked only if the request was successful.
*
* @param {Application} application Stormpath application the authentication result attaches to
*
* @param {Object} formData Authentication request data
*
* @param {Object} responseData The authentication result the API responded with.
*
* @param {Constructor} Ctor
* The constructor for the result instance to wrap the API response with, should
* inherit from {@link JwtAuthenticationResult}
*
* @param {Function} callback
* Callback function, will be called with (err, Ctor), where Ctor is the instance
* passed as the argument.
*/
ScopeFactoryAuthenticator.prototype.scopeAuthResult = function scopeAuthenticatorResult(application, formData, responseData, Ctor, callback) {
  var self = this;

  if (typeof this.scopeFactory === 'undefined') {
    return callback(null, new Ctor(application, responseData));
  }

  if (typeof this.signingKey === 'undefined') {
    callback(new Error('Signing key required for expanding the authentication result token through scope factories. Please use `setSigningKey` first'));
  }

  njwt.verify(responseData.access_token, this.signingKey, function(err, token) {
    if (err) {
      return callback(err);
    }

    self.scopeFactory(responseData, formData.scope, function(err, addedScope) {
      if (err) {
        return callback(err);
      }

      if (addedScope) {
        token.body.scope = addedScope;
        token.setSigningKey(self.signingKey);

        responseData.access_token = token.compact();
      }

      callback(null, new Ctor(application, responseData));
    });
  });
};

module.exports = ScopeFactoryAuthenticator;
