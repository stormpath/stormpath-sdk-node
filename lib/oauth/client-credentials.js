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
 * endpoint, when making a `client_credentials` grant request. This class allows you to
 * access the response data and get the access token and account that was authenticated.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link OAuthClientCredentialsAuthenticator#authenticate OAuthClientCredentialsAuthenticator.authenticate()}.
 *
 * @param {Application} application
 * The Stormpath Application that issued the tokens.
 *
 * @param {AccessTokenResponse} accessTokenResponse
 * The access token response from the Stormpath REST API.
 *
 */
function OAuthClientCredentialsAuthenticationResult(application, accessTokenResponse) {
  if (!(this instanceof OAuthClientCredentialsAuthenticationResult)) {
    return new OAuthClientCredentialsAuthenticationResult(application, accessTokenResponse);
  }

  OAuthClientCredentialsAuthenticationResult.super_.apply(this, arguments);

  /**
   * The access token response from the Stormpath REST API.
   *
   * @name OAuthClientCredentialsAuthenticationResult#accessTokenResponse
   *
   * @type {AccessTokenResponse}
   */
  this.accessTokenResponse = accessTokenResponse;

  /**
   * @name OAuthClientCredentialsAuthenticationResult#refreshToken
   *
   * @description
   *
   * Hidden
   *
   * @private
   */
}

util.inherits(OAuthClientCredentialsAuthenticationResult, JwtAuthenticationResult);

/**
 * @function
 *
 * @description
 * Get the access token resource for the authenticated account.
 *
 * @param {Function} callback
 * The callback to call with the parameters (err, {@link AccessToken})
 */
OAuthClientCredentialsAuthenticationResult.prototype.getAccessToken = function getAccessToken(callback) {
  var href = this.accessTokenResponse.stormpath_access_token_href;

  this.application.dataStore.getResource(href, require('../resource/AccessToken'), callback);
};

/**
 * @class
 *
 * @augments ScopeFactoryAuthenticator
 *
 * @description
 *
 * Creates an authenticator that can be used to exchange a client api key for an access token.
 * To configure the access token expiration times for the application, see {@link OAuthPolicy}.
 * The authenticator is bound to a Stormpath Application, so the authentication attempt will
 * be bound to the account stores that are mapped to this application.
 *
 * @param {Application} application The Stormpath Application to authenticate against.
 *
 * @example
 * var appHref = 'https://api.stormpath.com/v1/applications/3WIeKpaEjPHfLmy6GIvbwv';
 *
 * client.getApplication(appHref, function(err, application) {
 *   var authenticator = new stormpath.OAuthClientCredentialsAuthenticator(application);
 * });
 */
function OAuthClientCredentialsAuthenticator(application) {
  if (!(this instanceof OAuthClientCredentialsAuthenticator)) {
    return new OAuthClientCredentialsAuthenticator(application);
  }

  OAuthClientCredentialsAuthenticator.super_.apply(this, arguments);

  this.application = application;

}

util.inherits(OAuthClientCredentialsAuthenticator, ScopeFactoryAuthenticator);

/**
 * Formats and validates the object wrapping the api key into the format accepted by
 * the REST API and attaches the grant_type parameter to the form data.
 *
 * @private
 */
OAuthClientCredentialsAuthenticator.prototype._formatRequestBody = function _formatRequestBody(formData) {
  if (!formData || !formData.apiKey) {
    throw new Error('apiKey object within request is required');
  }

  if (!formData.apiKey.id || !formData.apiKey.secret) {
    throw new Error('apiKey object must contain \'id\' and \'secret\' fields');
  }

  return {
    client_id: formData.apiKey.id,
    client_secret: formData.apiKey.secret,
    grant_type: 'client_credentials'
  };
};

/**
 * @function
 *
 * @param {Object} clientCredentialsRequest
 * An object with the client credentials grant request properties.
 *
 * @param {Object} clientCredentialsRequest.apiKey
 * The api key object of the account that is attempting to authenticate.
 *
 * @param {String} clientCredentialsRequest.apiKey.id
 * The client id for the api key for the account that is attempting to authenticate.
 *
 * @param {String} clientCredentialsRequest.apiKey.secret
 * The client secret for the api key for the account that is attempting to authenticate.
 *
 * @param {String} [clientCredentialsRequest.scope]
 * User-requested scope that will be passed to the scope factory, if configured.
 * See {@link ScopeFactoryAuthenticator} for more details.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link OAuthClientCredentialsAuthenticationResult}).
 *
 * @example
 *
 * var clientCredentialsRequest = {
 *   apiKey: {
 *    id: 'WuQvJFCj+MNHy/MldQp/dVu9WjCc7EYl0yjR7fUp2ym',
 *    secret: '7HB3CD9YN5YXKFWRQEUIPMGZ1'
 *   };
 * };
 *
 * authenticator.authenticate(clientCredentialsRequest, function(err, oAuthClientCredentialsAuthenticationResult) {
 *   oAuthClientCredentialsAuthenticationResult.getAccount(function(err, account){
 *     console.log(
 *      oAuthClientCredentialsAuthenticationResult.accessTokenResponse.access_token
 *     );
 *   });
 * });
 *
 */
OAuthClientCredentialsAuthenticator.prototype.authenticate = function authenticate(authenticationRequest, callback) {
  var application = this.application;
  var self = this;

  if (typeof authenticationRequest !== 'object') {
    throw new Error('The \'authenticationRequest\' parameter must be an object.');
  }

  if (typeof callback !== 'function') {
    throw new Error('The \'callback\' parameter must be a function.');
  }

  var href = application.href + '/oauth/token';
  var apiData = this._formatRequestBody(authenticationRequest);
  var scopeFactoryData = util.extend({}, apiData, {scope: authenticationRequest.scope});

  application.dataStore.createResource(href, {form: apiData}, function(err, tokenData) {
    if (err) {
      return callback(err);
    }

    self.scopeAuthResult(application, scopeFactoryData, tokenData, OAuthClientCredentialsAuthenticationResult, callback);
  });
};

module.exports = {
  authenticator: OAuthClientCredentialsAuthenticator,
  authenticationResult: OAuthClientCredentialsAuthenticationResult
};
