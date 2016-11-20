'use strict';

var util = require('../utils');
var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');
var ScopeFactoryAuthenticator = require('./scope-factory-authenticator');

/**
 * @class
 *
 * @augments {JwtAuthenticationResult}
 *
 * @description
 *
 * Encapsulates the access token response from an application's `/oauth/token`
 * endpoint, when making a `stormpath_token` grant request.
 *
 * This class allows you to access the response data and get the account
 * that was authenticated.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link OAuthStormpathTokenAuthenticator#authenticate OAuthStormpathTokenAuthenticator.authenticate()}.
 *
 * @param {Application} application
 * The Stormpath Application that issued the tokens.
 *
 * @param {AccessTokenResponse} accessTokenResponse
 * The access token response from the Stormpath REST API.
 *
 */
function OAuthStormpathTokenAuthenticationResult(application, data){
  OAuthStormpathTokenAuthenticationResult.super_.apply(this, arguments);
  this.accessTokenResponse = data;
}

util.inherits(OAuthStormpathTokenAuthenticationResult, JwtAuthenticationResult);

/**
 * @class
 *
 * @augments ScopeFactoryAuthenticator
 *
 * @description
 *
 * Creates an authenticator that can be used to exchange a Stormpath Token for an
 * access token and refresh token pair.  A Stormpath Token is provided when a user
 * returns from ID Site, or from a SAML callback.  In either case, you may want
 * to exchange this token for a standard OAuth Access + Refresh token pair that
 * is bound to the authenticated account, and this authenticator will do that
 * for you.
 *
 * The authenticator is bound to a Stormpath Application, so the authentication
 * attempt will be bound to the account stores that are mapped to this application.
 * To configure the access and refresh token expiration times for the application,
 * see {@link OAuthPolicy}.
 *
 * @param {Application} application The Stormpath Application to authenticate against.
 *
 * @example
 * var appHref = 'https://api.stormpath.com/v1/applications/3WIeKpaEjPHfLmy6GIvbwv';
 *
 * client.getApplication(appHref, function(err, application) {
 *   var authenticator = new stormpath.OAuthStormpathTokenAuthenticator(application);*
 * });
 */
function OAuthStormpathTokenAuthenticator(application) {
  if (!(this instanceof OAuthStormpathTokenAuthenticator)) {
    return new OAuthStormpathTokenAuthenticator(application);
  }

  OAuthStormpathTokenAuthenticator.super_.apply(this, arguments);

  this.application = application;
}

util.inherits(OAuthStormpathTokenAuthenticator, ScopeFactoryAuthenticator);

/**
 * Exchange the Stormpath Token for an Access and Refresh token.
 *
 * @param {Object} tokenRequest
 * An object to encapsulate the request.
 *
 * @param {String} tokenRequest.stormpath_token
 * The Stormpath Token, from the ID Site or SAML callback.  This is a compacted JWT string.
 *
 * @param {String} [tokenRequest.scope]
 * User-requested scope that will be passed to the scope factory, if configured.
 * See {@link ScopeFactoryAuthenticator} for more details.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link OAuthStormpathTokenAuthenticationResult}).
 *
 * @example
 *
 * var tokenRequest = {
 *   token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzRHZNZ2JOVFEwZkhuS3BHd1VHUlB4IiwiaWF0IjoxNDcwMjU4MDc0LCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8yNGs3SG5ET3o0dFE5QVJzbVZ6YUNJIiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy8xdWxlM3dKbkxZVUw3VVE2OGFBdlJaOWwiLCJleHAiOjE0NzAyNjk0MTJ9.i4OWcqczU-us71zT2XIiL69s2srJ7YPH5mAzrw8rNE8'
 * };
 *
 * authenticator.authenticate(tokenRequest, function(err, oAuthStormpathTokenAuthenticationResult) {
 *   oAuthStormpathTokenAuthenticationResult.getAccount(function(err, account){
 *     console.log(
 *      'The access token for ' + account.email + ' is: ' +
 *      oAuthStormpathTokenAuthenticationResult.accessTokenResponse.access_token
 *     );
 *   });
 * });
 *
 */
OAuthStormpathTokenAuthenticator.prototype.authenticate = function authenticate(data, callback) {
  var application = this.application;
  var self = this;

  if (typeof data !== 'object') {
    throw new Error('The \'data\' parameter must be an object.');
  }

  if (typeof callback !== 'function') {
    throw new Error('The \'callback\' parameter must be a function.');
  }

  var formData = {
    grant_type: 'stormpath_token',
    token: data.stormpath_token
  };

  var scopeFactoryData = util.extend({}, formData, {scope: data.scope});

  var tokenHref = application.href + '/oauth/token';

  application.dataStore.createResource(tokenHref, { form: formData }, function(err, tokenData) {
    if (err) {
      return callback(err);
    }

    self.scopeAuthResult(application, scopeFactoryData, tokenData, OAuthStormpathTokenAuthenticationResult, callback);
  });
};

module.exports = {
  authenticator: OAuthStormpathTokenAuthenticator,
  authenticationResult: OAuthStormpathTokenAuthenticationResult
};
