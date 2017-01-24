var nJwt = require('njwt');
var Client = require('../Client');
var StormpathAccessTokenAuthenticationResult = require('./stormpath-access-token-authentication-result');

function tenantAdminKeyResolver(client, kid, callback) {
  client.getApiKeyById(kid, function(err, apiKey) {
    if (err) {
      return callback(err);
    }

    apiKey.getAccount(function(err, account) {
      if (err) {
        return callback(err);
      }

      account.getDirectory(function(err, directory) {
        if (err) {
          return callback(err);
        }

        if (directory.name === 'Stormpath Administrators') {
          return callback(null, apiKey.secret);
        }

        callback(new Error('Invalid kid'));
      });
    });
  });
}

/**
 * @class
 *
 * @constructor
 *
 * @description
 *
 * Creates an authenticator that can be used to validate access tokens that have
 * been issued by a Stormpath Tenant, using API Keys created for accounts in that
 * tenant's  "Stormpath Administrators" directory.  Access tokens can be issued
 * with one of the following methods:
 *
 * - {@link OAuthClientCredentialsAuthenticator#authenticate OAuthClientCredentialsAuthenticator.authenticate()}
 * - {@link OAuthPasswordGrantRequestAuthenticator#authenticate OAuthPasswordGrantRequestAuthenticator.authenticate()}
 * - {@link OAuthStormpathTokenAuthenticator#authenticate OAuthStormpathTokenAuthenticator.authenticate()}
 *
 * @param {Client} client A constructed {@link Client} instance, which will be bound to
 * the Stormpath Tenant in which access token tokens will be validated.
 *
 * @example
 * var client = new stormpath.Client();
 *
 * var authenticator = new stormpath.StormpathAccessTokenAuthenticator(client);
 *
 */
function StormpathAccessTokenAuthenticator(client) {
  if (!(this instanceof StormpathAccessTokenAuthenticator)) {
    return new StormpathAccessTokenAuthenticator(client);
  }

  if (!(client instanceof Client)) {
    throw new Error('StormpathAccessTokenAuthenticator must be given a Stormpath client instance');
  }

  this.client = client;
  this.verifier = nJwt.createVerifier().withKeyResolver(tenantAdminKeyResolver.bind(null, client));
}

StormpathAccessTokenAuthenticator.prototype.localValidation = false;

/**
 * Calling this method will convert this authenticator to "local validation" mode.
 * In this mode, the authenticator will cache the related access token resource,
 * and subsequent authentication attempts will skip the REST API request for the
 * access token resource, until that resource expires from the local cache, as
 * configured by your caching rules (see {@link Client}). This can speed up your
 * authentication layer, as the authentication is now done locally without a
 * network request.
 *
 * **Warning.  This mode has a security tradeoff.** Because of the caching nature
 * of this mode, access tokens will be considred valid until the expire, and your
 * local application will not know if another process as deleted this resource from
 * the Stormpath REST API.  When using local validation, we suggest shorter
 * expiration times, as configured by the issuing application's {@link OAuthPolicy}.
 *
 * @example
 *
 * var authenticator = new stormpath.StormpathAccessTokenAuthenticator(client);
 *
 * authenticator.withLocalValidation();
 */
StormpathAccessTokenAuthenticator.prototype.withLocalValidation = function withLocalValidation() {
  this.localValidation = true;
  return this;
};

/**
 * Indicate a specific Stormpath Application as an additional authorization check.
 * If an application is specified, the authentication attempt will fail if the
 * access token was not issued by the specified application.
 *
 * @param {Application|Object} application An {@link Application} instance, or object
 * literal with an href property that indicates the desired application.
 *
 * @example
 *
 * var client = new stormpath.Client();
 *
 * var authenticator = new stormpath.StormpathAccessTokenAuthenticator(client);
 *
 * var applicationHref = 'https://api.stormpath.com/v1/applications/3WIeKpaEjPHfLmy6GIvbwv';
 *
 * authenticator.forApplication({
 *   href: applicationHref
 * });
 */
StormpathAccessTokenAuthenticator.prototype.forApplication = function forApplication(application) {
  this.forApplicationHref = application.href;
  return this;
};

/**
 * Authenticates an access token, in the form of compact JWT string.
 *
 * @param {String} jwtAccessTokenString The compact JWT string
 * @param {Function} callback Will be called with (err, {@link StormpathAccessTokenAuthenticationResult}).
 *
 * @example
 * var jwtAccessTokenString = 'eyJraWQiOiI2NldURFJVM1paSkNZVFJVVlZTUUw3WEJOIiwic3R0IjoiYWNjZXNzIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiIzV0llS3N1SmR6YWR5YzN4U1ltc1l6IiwiaWF0IjoxNDY5ODMzNzQ3LCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8yNGs3SG5ET3o0dFE5QVJzQnRQVU42Iiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy8yRWRHb3htbGpuODBlRHZjM0JzS05EIiwiZXhwIjoxNDY5ODM0MzQ3LCJydGkiOiIzV0llS3BhRWpQSGZMbXk2R0l2Ynd2In0.9J7HvhgJZxvxuE-0PiarTDTFPCVVLR_nvRByULNA01Q';
 *
 * authenticator.authenticate(jwtAccessTokenString, function(err, authenticationResult) {
 *   if (err) {
 *     console.log(err);
 *   } else {
 *     authenticationResult.getAccount(function(err, account){
 *       console.log('Authenticated Account', account);
 *     });
 *   }
 * });
 */
StormpathAccessTokenAuthenticator.prototype.authenticate = function authenticate(jwtAccessTokenString, callback) {
  var self = this;

  self.verifier.verify(jwtAccessTokenString, function(err, jwt) {
    if (err) {
      return callback(err);
    }

    var resourceHref;

    // Validate against the provided application, if configured.
    // Otherwise, validate directly against the access token resource
    if (self.forApplicationHref) {
      resourceHref = self.forApplicationHref + '/authTokens/' + jwtAccessTokenString;
    } else {
      resourceHref = self.client.config.client.baseUrl + '/accessTokens/' + jwt.body.jti;
    }

    // Bypass the cache if local validation is disabled.
    var query = self.localValidation ? null : {
      nocache: true
    };

    self.client.getResource(resourceHref, query, function(err, authTokenResponse) {
      if (err) {
        return callback(err);
      }

      // If the incoming token has scope, preserve that for the developer.
      if (jwt.body.scope) {
        authTokenResponse.expandedJwt.claims.scope = jwt.claims.scope;
      }

      return callback(null, new StormpathAccessTokenAuthenticationResult(self.client, authTokenResponse));
    });
  });
};

module.exports = StormpathAccessTokenAuthenticator;
