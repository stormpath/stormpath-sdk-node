'use strict';

var util = require('util');
var nJwt = require('njwt');

var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');

/**
 * @class
 *
 * @augments {JwtAuthenticationResult}
 *
 * @description
 *
 * Encapsulates the access token response from an application's `/oauth/token`
 * endpoint, when making a `client_credentials` grant request. This class allows you to
 * access the response data and get access token and the refresh token for the account
 * that was authenticated.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link OAuthClientCredentialsRequestAuthenticator#authenticate OAuthClientCredentialsRequestAuthenticator.authenticate()}.
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
}

OAuthClientCredentialsAuthenticationResult.prototype.getAccessToken = function getAccessToken(callback) {
  var href = this.accessTokenResponse.stormpath_access_token_href;

  this.application.dataStore.getResource(href, require('../resource/AccessToken'), callback);
};

OAuthClientCredentialsAuthenticationResult.prototype.getRefreshToken = function getRefreshToken(callback) {
  var href = '/refreshTokens/' + this.accessToken.body.jti;

  this.application.dataStore.getResource(href, require('../resource/RefreshToken'), callback);
};

util.inherits(OAuthClientCredentialsAuthenticationResult, JwtAuthenticationResult);

OAuthClientCredentialsAuthenticationResult.prototype.getAccessToken = function getAccessToken() {
  //getAccessToken() - the response will have a stormpath_access_token_href, which can be used to fetch the AccessToken resource.
};

OAuthClientCredentialsAuthenticationResult.prototype.getRefreshToken = function getRefreshToken() {
  //getRefreshToken() - unpack the access_token and find the rti value, then the HREF of the RefreshToken resource is https://api.stormpath.com/v1/refreshTokens/:rti
};

/**
 * @class
 *
 * @description
 *
 * Creates an authenticator that can be used to exchange a username and password
 * for an access token and refresh token pair.  To configure the access and refresh token
 * expiration times for the application, see {@link OAuthPolicy}. The authenticator is bound to a
 * Stormpath Application, so the authentication attempt will be bound to the
 * account stores that are mapped to this application.
 *
 * @param {Application} application The Stormpath Application to authenticate against.
 *
 * @example
 * var appHref = 'https://api.stormpath.com/v1/applications/3WIeKpaEjPHfLmy6GIvbwv';
 *
 * client.getApplication(appHref, function(err, application) {
 *   var authenticator = new stormpath.OAuthClientCredentialsRequestAuthenticator(application);*
 * });
 */
function OAuthClientCredentialsRequestAuthenticator(application) {
  if (!(this instanceof OAuthClientCredentialsRequestAuthenticator)) {
    return new OAuthClientCredentialsRequestAuthenticator(application);
  }

  this.application = application;
}

OAuthClientCredentialsRequestAuthenticator.prototype._formatRequestBody = function _formatRequestBody(data) {
  if (!data || !data.apiKey) {
    throw new Error('apiKey object within request is required');
  }

  if (!data.apiKey.id || !data.apiKey.secret) {
    throw new Error('apiKey object must contain "id" and "secret" fields');
  }

  return {
    client_id: data.apiKey.id,
    client_secret: data.apiKey.secret
  };
};

/**
 * @function
 *
 * @param {Object} ClientCredentialsRequest
 * An object with the password grant request properties.
 *
 * TODO Fix these params
 * @param {String} ClientCredentialsRequest.username
 * The username or email address of the account that is attempting to authenticate.
 *
 * @param {String} ClientCredentialsRequest.password
 * The password of the account that is attempting to authenticate.
 *
 * @param {String} [ClientCredentialsRequest.accountStore]
 * The HREF of an account store to target during the authentication attempt.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link OAuthClientCredentialsAuthenticationResult}).
 *
 * @example
 *
 * var authenticationRequest = {
 *   apiKey: {
 *    id: 'WuQvJFCj+MNHy/MldQp/dVu9WjCc7EYl0yjR7fUp2ym',
 *    secret: '7HB3CD9YN5YXKFWRQEUIPMGZ1'
 *   };
 * };
 *
 * authenticator.authenticate(authenticationRequest, function(err, oAuthClientCredentialsAuthenticationResult) {
 *   oAuthClientCredentialsAuthenticationResult.getAccount(function(err, account){
 *     console.log(
 *      oAuthClientCredentialsAuthenticationResult.accessTokenResponse.access_token
 *     );
 *   });
 * });
 *
 */
OAuthClientCredentialsRequestAuthenticator.prototype.authenticate = function authenticate(data, callback) {
  var application = this.application;

  if (arguments.length !== 2) {
    throw new Error('Must call authenticate with (data,callback)');
  } else {
    var href = application.href + '/oauth/token';
    var apiData = this._formatRequestBody(data);
    apiData.grant_type = 'client_credentials';


    application.dataStore.createResource(href, {form: apiData}, function(err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, new OAuthClientCredentialsAuthenticationResult(application, data));
    });
  }
};

module.exports = {
  authenticator: OAuthClientCredentialsRequestAuthenticator,
  authenticationResult: OAuthClientCredentialsAuthenticationResult
};
