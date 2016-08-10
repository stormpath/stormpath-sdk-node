'use strict';

var njwt = require('njwt');
var AssertionAuthenticationResult = require('./AssertionAuthenticationResult');

/**
 * @class
 *
 * @description
 *
 * Creates an authenticator that can be used to verify a Stormpath Token that was
 * provided when the user returned from ID Site, or a SAML callback.  This method
 * only verifies the token and provides you with any errors.  After using this
 * authenticator you will likely want to use the {@link OAuthStormpathTokenAuthenticator}
 * to generate an Access + Refresh token pair for the user.
 *
 * Note: this authenticator is bound to the API Key Pair of the client that
 * fetched the application resource that you pass to the constructor.
 *
 * @param {Application} application The Stormpath Application to authenticate against.
 *
 * @example
 * var appHref = 'https://api.stormpath.com/v1/applications/3WIeKpaEjPHfLmy6GIvbwv';
 *
 * client.getApplication(appHref, function(err, application) {
 *   var authenticator = new stormpath.StormpathAssertionAuthenticator(application);
 * });
 */
function StormpathAssertionAuthenticator(application) {
  Object.defineProperty(this, 'dataStore', {
    enumerable:false,
    value: application.dataStore
  });

  this.secret = this.dataStore.requestExecutor.options.client.apiKey.secret;
}

/**
 * Exchange the Stormpath Token for an Access and Refresh token.
 *
 * @param {Object} tokenRequest
 * An object to encapsulate the request.
 *
 * @param {String} tokenRequest.stormpath_token
 * The Stormpath Token, from the ID Site or SAML callback.  This is a compacted JWT string.
 *
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link AssertionAuthenticationResult}).
 *
 * @example
 *
 * var stormpathToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzRHZNZ2JOVFEwZkhuS3BHd1VHUlB4IiwiaWF0IjoxNDcwMjU4MDc0LCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8yNGs3SG5ET3o0dFE5QVJzbVZ6YUNJIiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy8xdWxlM3dKbkxZVUw3VVE2OGFBdlJaOWwiLCJleHAiOjE0NzAyNjk0MTJ9.i4OWcqczU-us71zT2XIiL69s2srJ7YPH5mAzrw8rNE8';
 *
 * authenticator.authenticate(stormpathToken, function(err, assertionAuthenticationResult) {
 *   assertionAuthenticationResult.getAccount(function(err, account){
 *     if (err) {
 *       // an error occured on ID Site or during the SAML authentication flow
 *       console.error(err);
 *       return;
 *     }
 *     console.log(account.email + ' has authenticated');
 *   });
 * });
 *
 */
StormpathAssertionAuthenticator.prototype.authenticate = function authenticate(stormpathToken, callback) {
  var dataStore = this.dataStore;
  njwt.verify(stormpathToken, this.secret, function (err, jwt) {
    if (err) {
      err.statusCode = 401;
      return callback(err);
    }

    if (jwt.body.err){
      return callback(jwt.body.err);
    }

    // For Stormpath mapped JWT fields, see:
    // https://docs.stormpath.com/rest/product-guide/latest/005_auth_n.html#step-5-stormpath-response-with-jwt
    var accountHref = jwt.body.sub;

    if (!accountHref) {
      return callback(new Error('Stormpath Account HREF (sub) in JWT not provided.'));
    }

    callback(null, new AssertionAuthenticationResult(
      dataStore, {
        stormpath_token: stormpathToken,
        expandedJwt: jwt,
        account: {
          href: accountHref
        }
      }
    ));
  });

  return this;
};

module.exports = StormpathAssertionAuthenticator;
