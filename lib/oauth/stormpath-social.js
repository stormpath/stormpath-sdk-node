'use strict';

var util = require('util');
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
 * @augments ScopeFactoryAuthenticator
 *
 * @description
 *
 * Creates an authenticator that can be used to exchange an authorization code or access token, obtained from
 * a social provider, for a Stormpath Access Token and Refresh Token.  The new tokens will be issued by the
 * given Stormpath Application.
 *
 * The authenticator is bound to the Stormpath Application, so the authentication
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
 *   var authenticator = new stormpath.OAuthStormpathSocialAuthenticator(application);
 * });
 */
function OAuthStormpathSocialAuthenticator(application) {
  if (!(this instanceof OAuthStormpathSocialAuthenticator)) {
    return new OAuthStormpathSocialAuthenticator(application);
  }

  this.application = application;
}

util.inherits(OAuthStormpathSocialAuthenticator, ScopeFactoryAuthenticator);

/**
 * Exchange an authorization code or access token, provided by a social provier, for a Stormpath Access Token and Refresh token.
 *
 * @param {Object} authenticationRequest
 * An object to encapsulate the request.  One of `accessToken` or `code` must be
 * provided.
 *
 * @param {String} authenticationRequest.providerId
 * The identity of the provider that provided the code or access token, e.g. `facebook`, `google`, `github`, `linkedin`.
 *
 * @param {String} [authenticationRequest.accessToken]
 * The access token, obtained from the provider.
 *
 * @param {String} [authenticationRequest.code]
 * The authorization code, obtained from the provider.
 *
 * @param {String} [authenticationRequest.scope]
 * User-requested scope that will be passed to the scope factory, if configured.
 * See {@link ScopeFactoryAuthenticator} for more details.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link OAuthStormpathSocialAuthenticationResult}).
 *
 * @example
 *
 * // Authorization Code example, with code obtained from Google login callback
 *
 * var authenticationRequest = {
 *   providerId: 'google',
 *   code: '5LvvqjEJl9zhoAbkNj9vFUgOBsePjpm7XY'
 * };
 *
 * authenticator.authenticate(authenticationRequest, function(err, authResult) {
 *   authResult.getAccount(function(err, account){
 *     console.log('The access token for %s is %s', account.email, authResult.accessTokenResponse.access_token);
 *   });
 * });
 *
 * @example
 *
 * // Access Token example, with code obtained from Facebook login pop-up
 *
 * var authenticationRequest = {
 *   providerId: 'facebook',
 *   accessToken: 'Sb8BvqbpxxzqjEJl9QlzKDfxfdf2d5d1NMerEAHPMqYfeoZB0CIimgBhk1DK6KFZAOF5xJB6grrrgcuOZAnekyxxURTsPaiIQ9exmzv'
 * };
 *
 * authenticator.authenticate(authenticationRequest, function(err, authResult) {
 *   authResult.getAccount(function(err, account){
 *     console.log('The access token for %s is %s', account.email, authResult.accessTokenResponse.access_token);
 *   });
 * });
 */
OAuthStormpathSocialAuthenticator.prototype.authenticate = function authenticate(authenticationRequest, callback) {
  var application = this.application;

  if (typeof authenticationRequest !== 'object') {
    throw new Error('The \'authenticationRequest\' parameter must be an object.');
  }

  if (typeof authenticationRequest.providerId !== 'string') {
    throw new Error('The \'authenticationRequest.providerId\' parameter must be a string.');
  }

  if (!authenticationRequest.code && !authenticationRequest.accessToken) {
    throw new Error('One of the parameters \'authenticationRequest.code\' or \'authenticationRequest.accessToken\' must be provided.');
  }

  if (typeof callback !== 'function') {
    throw new Error('The \'callback\' parameter must be a function.');
  }

  var formData = {
    grant_type: 'stormpath_social',
    providerId: authenticationRequest.providerId,
    code: authenticationRequest.code,
    accessToken: authenticationRequest.accessToken
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
