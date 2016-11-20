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
 * endpoint, when making a `password` grant request. This class allows you to
 * access the response data and get the account that was authenticated.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link OAuthPasswordGrantRequestAuthenticator#authenticate OAuthPasswordGrantRequestAuthenticator.authenticate()}.
 *
 * @param {Application} application
 * The Stormpath Application that issued the tokens.
 *
 * @param {AccessTokenResponse} accessTokenResponse
 * The access token response from the Stormpath REST API.
 *
 */
function OAuthPasswordGrantAuthenticationResult(application,accessTokenResponse){
  if (!(this instanceof OAuthPasswordGrantAuthenticationResult)) {
    return new OAuthPasswordGrantAuthenticationResult(application,accessTokenResponse);
  }

  OAuthPasswordGrantAuthenticationResult.super_.apply(this, arguments);

  /**
   * The access token response from the Stormpath REST API.
   *
   * @name OAuthPasswordGrantAuthenticationResult#accessTokenResponse
   *
   * @type {AccessTokenResponse}
   */
  this.accessTokenResponse = accessTokenResponse;
}

util.inherits(OAuthPasswordGrantAuthenticationResult, JwtAuthenticationResult);

/**
 * @class
 *
 * @augments ScopeFactoryAuthenticator
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
 *   var authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
 * });
 */
function OAuthPasswordGrantRequestAuthenticator(application) {
  if (!(this instanceof OAuthPasswordGrantRequestAuthenticator)) {
    return new OAuthPasswordGrantRequestAuthenticator(application);
  }

  OAuthPasswordGrantRequestAuthenticator.super_.apply(this, arguments);

  this.application = application;
}

util.inherits(OAuthPasswordGrantRequestAuthenticator, ScopeFactoryAuthenticator);

/**
 * @function
 *
 * @param {Object} passwordGrantRequest
 * An object with the password grant request properties.
 *
 * @param {String} passwordGrantRequest.username
 * The username or email address of the account that is attempting to authenticate.
 *
 * @param {String} passwordGrantRequest.password
 * The password of the account that is attempting to authenticate.
 *
 * @param {String} [passwordGrantRequest.scope]
 * User-requested scope that will be passed to the scope factory, if configured.
 * See {@link ScopeFactoryAuthenticator} for more details.
 *
 * @param {String} [passwordGrantRequest.accountStore]
 * The HREF of an account store to target during the authentication attempt.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link OAuthPasswordGrantAuthenticationResult}).
 *
 * @example
 *
 * var passwordGrantRequest = {
 *   username: 'foo@example.com',
 *   password: 'p@ssword!1'
 * };
 *
 * authenticator.authenticate(passwordGrantRequest, function(err, oAuthPasswordGrantAuthenticationResult) {
 *   oAuthPasswordGrantAuthenticationResult.getAccount(function(err, account){
 *     console.log(
 *      'The access token for ' + account.email + ' is: ' +
 *      oAuthPasswordGrantAuthenticationResult.accessTokenResponse.access_token
 *     );
 *   });
 * });
 *
 */
OAuthPasswordGrantRequestAuthenticator.prototype.authenticate = function authenticate(formData, callback) {
  var application = this.application;
  var self = this;

  if(arguments.length !==2 ){
    throw new Error('Must call authenticate with (data,callback)');
  }else{
    var href = application.href + '/oauth/token';
    formData.grant_type='password';

    var form = util.extend({}, formData);

    // No need to send the scope to the API
    if (form.scope) {
      delete form.scope;
    }

    application.dataStore.createResource(href, {form: form}, function(err, data) {
      if(err){
        return callback(err);
      }

      self.scopeAuthResult(application, formData, data, OAuthPasswordGrantAuthenticationResult, callback);
    });
  }
};

module.exports = {
  authenticator: OAuthPasswordGrantRequestAuthenticator,
  authenticationResult: OAuthPasswordGrantAuthenticationResult
};
