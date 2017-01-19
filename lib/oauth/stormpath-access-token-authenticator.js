var Client = require('../Client');

var nJwt = require('njwt');

var StormpathAccessTokenAuthenticationResult = require('./stormpath-access-token-authentication-result');

function tenantAdminKeyResolver(client, kid, callback){
  client.getApiKeyById(kid, function (err, apiKey) {
    if (err) {
      return callback(err);
    }
    apiKey.getAccount(function (err, account) {
      if (err) {
        return callback(err);
      }
      account.getDirectory(function (err, directory) {
        if (err) {
          return callback(err);
        }
        if (directory.name === 'Stormpath Administrators') {
          return callback(null, apiKey.secret);
        }
        return callback(new Error('Invalid kid'));
      });
    });
  });
}


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
 * In this mode, the authenticator will skip the REST API call which determines
 * if the {@link AccessToken} resource has been revoked. Tokens will be considered
 * valid if they are signed by the original signing key (one of your Tenant API Keys)
 * and are not expired.  **Please be aware of this security tradeoff.** When using
 * local validation, we suggest shorter expiration times, as configured by the
 * issuing application's {@link OAuthPolicy}.
 *
 * @example
 *
 * var authenticator = new stormpath.StormpathAccessTokenAuthenticator();
 *
 * authenticator.withLocalValidation();
 */
StormpathAccessTokenAuthenticator.prototype.withLocalValidation = function withLocalValidation() {
  this.localValidation = true;
  return this;
};

StormpathAccessTokenAuthenticator.prototype.forApplicationHref = function forApplicationHref(href) {
  this.forApplicationHref = href;
  return this;
};

StormpathAccessTokenAuthenticator.prototype.authenticate = function authenticate (jwtAccessTokenString, callback){
  var self = this;
  self.verifier.verify(jwtAccessTokenString, function (err, jwt) {
    if (err) {
      return callback(err);
    }

    var applicationHref = self.forApplicationHref || jwt.body.iss;

    // Vaildate against the provided application, or just the issuing applicaiotns

    var href = applicationHref + '/authTokens/'+jwtAccessTokenString;

    // Bypass the cache if local validation is disabled

    var query = self.localValidation ? null : { nocache: true};

    self.client.getResource(href, query, function(err, authTokenResponse){
      if(err){
        return callback(err);
      }

      // If the incoming token has scope, preserve that for the developer

      if (jwt.body.scope) {
        authTokenResponse.expandedJwt.claims.scope = jwt.claims.scope;
      }

      return callback(null, new StormpathAccessTokenAuthenticationResult(self.client, authTokenResponse));
    });

  });
};

module.exports = StormpathAccessTokenAuthenticator;