'use strict';

var njwt = require('njwt');

/**
* @class
*
* @description
* Encapsulates the behavior required by OAuth authenticator classes for adding
* scope to access tokens that are created by Stormpath.
*
* This class allows you to use scope factory functions to attach scope to JWT objects,
* thus expanding the result and permitting runtime access control checks, searching,
* etc.
*
* This class should not be constructed manually. Instead, these methods are available
* on the following authenticators:
*
* * {@link OAuthClientCredentialsAuthenticator}
* * {@link OAuthPasswordGrantRequestAuthenticator}
* * {@link OAuthStormpathSocialAuthenticator}
* * {@link OAuthStormpathTokenAuthenticator}
* @example
* var application; // An application, fetched from Client.getApplication()
*
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
* var authenticator = new OAuthPasswordGrantRequestAuthenticator(application);
* authenticator.setScopeFactory(groupScopeFactory);
* authenticator.setSigningKey(tenantApiKeySecret); // Same secret that was given to the previously used client
*
* authenticator.authenticate({
*   username: 'user@example.com',
*   password: 'PAs$w0rd',
* }, function (err, oAuthPasswordGrantAuthenticationResult) {
*   if (err) {
*     return console.log(err);
*   }
*   console.log('Access token: ', oAuthPasswordGrantAuthenticationResult.accessToken)
* });
*/
function ScopeFactoryAuthenticator() {}

/**
* @function
*
* @description
* Sets the scope factory to be used when parsing tokens.  The scope factory is a
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
* * `authenticationResult` is the authentication result from the authenticator's
* authentication result class.  You can use this to fetch the account that has
* authenticated.
*
* * `requestedScope` is the scope that end-user requested, and passed as the `scope`
* option on the authenticator's `authenticate()` method.
*
* * `callback` should be called with `(err, grantedScope)`
*/
ScopeFactoryAuthenticator.prototype.setScopeFactory = function setAuthenticatorScopeFactory(scopeFactory) {
  this.scopeFactory = scopeFactory;
};

/**
* @function
*
* @description
* Sets the signing that is used to sign the new access token.
*
* @param {String} signingKey
* Signing key used to pack and unpack JWTs. It is <b>required</b> if the scope
* factory is set. If the factory is invoked without a signing key, an error will
* be passed to the callback.
*
* This must be the same Tenant API Key Secret that you used to create the {@link Client}
* that was used to initiate the authentication attempt.
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

    var responseInstance = new Ctor(application, responseData);

    self.scopeFactory(responseInstance, formData.scope, function(err, grantedScope) {
      if (err) {
        return callback(err);
      }

      if (grantedScope) {
        token.body.scope = grantedScope;
        token.setSigningKey(self.signingKey);

        responseData.access_token = token.compact();
        responseInstance = new Ctor(application, responseData);
      }

      callback(null, responseInstance);
    });
  });
};

module.exports = ScopeFactoryAuthenticator;
