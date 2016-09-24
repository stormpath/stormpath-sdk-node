'use strict';

var util = require('util');
var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');

/**
 * @class
 *
 * @augments {JwtAuthenticationResult}
 *
 * @description
 *
 * Encapsulates the access token response from an application's `/oauth/token`
 * endpoint, when making a `stormpath_social` grant request.
 *
 * This class allows you to access the response data and get the account
 * that was authenticated.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link OAuthStormpathSocialAuthenticator#authenticate OAuthStormpathSocialAuthenticator.authenticate()}.
 *
 * @param {Application} application
 * The Stormpath Application that you want tokens issued for.
 *
 * @param {AccessTokenResponse} accessTokenResponse
 * The access token response from the Stormpath REST API.
 *
 */
function OAuthStormpathSocialAuthenticationResult(application, data){
  OAuthStormpathSocialAuthenticationResult.super_.apply(this, arguments);
  this.accessTokenResponse = data;
}
util.inherits(OAuthStormpathSocialAuthenticationResult, JwtAuthenticationResult);

/**
 * @class
 *
 * @description
 *
 * Creates an authenticator that can be used to exchange a Stormpath Social grant (authorization code or access token)
 * for an access token and refresh token pair. A Stormpath Social grant (authorization code or access token)
 * is provided when a user gains authorization from an OAuth provider or redirected from OAuth provider callback.
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
 *   var authenticator = new stormpath.OAuthStormpathSocialAuthenticator(application);*
 * });
 */
function OAuthStormpathSocialAuthenticator(application) {
  if (!(this instanceof OAuthStormpathSocialAuthenticator)) {
    return new OAuthStormpathSocialAuthenticator(application);
  }

  this.application = application;
}

/**
 * Exchange the Stormpath Social authorization code or access token for an Access and Refresh token.
 *
 * @param {Object} data
 * An object to encapsulate the request.
 *
 * @param {String} [data.providerId]
 * The identity of the provider to exchange a access token or authorization code for. E.g. 'facebook', 'google' or 'github'.
 *
 * @param {String} [data.accessToken]
 * The provider access token.
 *
 * @param {String} [data.code]
 * The provider authorization code.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link OAuthStormpathSocialAuthenticationResult}).
 *
 * @example
 *
 * var data = {
 *   code: ''
 * };
 *
 * authenticator.authenticate(data, function(err, authResult) {
 *   authResult.getAccount(function(err, account){
 *     console.log('The access token for %s is %s', account.email, authResult.accessTokenResponse.access_token);
 *   });
 * });
 */
OAuthStormpathSocialAuthenticator.prototype.authenticate = function authenticate(data, callback) {
  var application = this.application;

  if (typeof data !== 'object') {
    throw new Error('The \'data\' parameter must be an object.');
  }

  if (typeof data.providerId !== 'string') {
    throw new Error('The \'data.providerId\' parameter must be a string.');
  }

  if (!data.code && !data.accessToken) {
    throw new Error('One of the parameters \'data.code\' or \'data.accessToken\' must be provided.');
  }

  if (typeof callback !== 'function') {
    throw new Error('The \'callback\' parameter must be a function.');
  }

  var formData = {
    grant_type: 'stormpath_social',
    providerId: data.providerId,
    code: data.code,
    accessToken: data.accessToken
  };

  var tokenHref = application.href + '/oauth/token';

  application.dataStore.createResource(tokenHref, { form: formData }, function(err, tokenData) {
    if (err) {
      return callback(err);
    }

    callback(null, new OAuthStormpathSocialAuthenticationResult(application, tokenData));
  });
};

module.exports = {
  authenticator: OAuthStormpathSocialAuthenticator,
  authenticationResult: OAuthStormpathSocialAuthenticationResult
};
