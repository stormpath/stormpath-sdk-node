'use strict';

var util = require('util');

var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');

/**
 * @class
 *
 * @augments {JwtAuthenticationResult}
 *
 * @description Encapsulates the access token response from the Stormpath REST
 * API, for password grant responses.
 *
 * @param {Application} application The Stormpath Application that issued the
 * tokens.
 *
 * @param {AccessTokenResponse} accessTokenResponse - The access token
 * response from the Stormpath REST API.
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
* @description
*
* Use this authenticator to exchange a username and password for an access token
* and refresh token pair.
*
* @param {Application} application The Stormpath Application that will be used
* for the authentication attempt.
*
* @example
*
* var stormpath = require('stormpath');
*
* var client = new stormpath.Client();
*
* client.getApplication('myAppHref', function(err, application){
*   var authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
* });
*/
function OAuthPasswordGrantRequestAuthenticator(application) {
  if (!(this instanceof OAuthPasswordGrantRequestAuthenticator)) {
    return new OAuthPasswordGrantRequestAuthenticator(application);
  }

  this.application = application;
}

/**
 * @function
 *
 * @param  {Object} passwordGrantRequest
 * An object with the password grant request properties.
 *
 * @param {String} passwordGrantRequest.username
 * The username or email address of the account that is attempting to authenticate.
 *
 * @param {String} passwordGrantRequest.password
 * The password of the account that is attempting to authenticate.
 *
 * @param {String} [passwordGrantRequest.accountStore]
 * The HREF of an account store to target during the authentication attempt.
 *
 * @param {Function} callback
 * Authentication result callback, see
 * {@link OAuthPasswordGrantRequestAuthenticator~passwordGrantCallback passwordGrantCallback}.
 *
 * @example
 *
 * authenticator.authenticate({
 *   username: 'email or username',
 *   password: 'the password'
 * }, function(err, oAuthPasswordGrantAuthenticationResult){
 *   // foo
 * });
 */
OAuthPasswordGrantRequestAuthenticator.prototype.authenticate = function authenticate(data,callback) {
  var application = this.application;
  if(arguments.length !==2 ){
    throw new Error('Must call authenticate with (data,callback)');
  }else{
    var href = application.href + '/oauth/token';
    data.grant_type='password';
    application.dataStore.createResource(href,{form:data},function(err,data){
      if(err){
        return callback(err);
      }
      callback(null,new OAuthPasswordGrantAuthenticationResult(application,data));
    });
  }
};

/**
 * This callback will be called with the authentication result, or an error.
 *
 * @callback OAuthPasswordGrantRequestAuthenticator~passwordGrantCallback
 *
 * @param {Object|null} error - Error message from the Stormpath REST API.
 *
 * @param {OAuthPasswordGrantAuthenticationResult} oAuthPasswordGrantAuthenticationResult -
 * The authentication result, which contains the access token response.
 */

module.exports = {
  authenticator: OAuthPasswordGrantRequestAuthenticator,
  authenticationResult: OAuthPasswordGrantAuthenticationResult
};
