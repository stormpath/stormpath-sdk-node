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
 * endpoint, when making a `refresh_token` grant request. This class allows you
 * to access the response data and get the account that was authenticated.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link OAuthRefreshTokenGrantAuthenticator#authenticate OAuthRefreshTokenGrantAuthenticator.authenticate()}.
 *
 * @param {Application} application
 * The Stormpath Application that issued the tokens.
 *
 * @param {AccessTokenResponse} accessTokenResponse
 * The access token response from the Stormpath REST API.
 *
 */
function OAuthRefreshTokenGrantAuthenticationResult(application,data){
  if (!(this instanceof OAuthRefreshTokenGrantAuthenticationResult)) {
    return new OAuthRefreshTokenGrantAuthenticationResult(application,data);
  }

  OAuthRefreshTokenGrantAuthenticationResult.super_.apply(this, arguments);
  this.accessTokenResponse = data;
}

util.inherits(OAuthRefreshTokenGrantAuthenticationResult, JwtAuthenticationResult);

/**
 * @class
 *
 * @constructor
 *
 * @description
 *
 * Creates an authenticator that can exchange an existing {@link RefreshToken}
 * for a new {@link AccessToken}.
 *
 * @param {Application} application
 * The Stormpath Application to authenticate against, this should be the same
 * application that was used when the Refresh Token was created.
 *
 * @example
 * var appHref = 'https://api.stormpath.com/v1/applications/3WIeKpaEjPHfLmy6GIvbwv';
 *
 * client.getApplication(appHref, function (err, application) {
 *   var authenticator = new stormpath.OAuthRefreshTokenGrantAuthenticator(application);
 * });
 */
function OAuthRefreshTokenGrantAuthenticator(application) {
  if (!(this instanceof OAuthRefreshTokenGrantAuthenticator)) {
    return new OAuthRefreshTokenGrantAuthenticator(application);
  }

  this.application = application;
}

/**
 * Exchange the Refresh Token for a new Access Token
 *
 * @param {Object} tokenRequest
 * An object to encapsulate the request.
 *
 * @param {String} tokenRequest.refresh_token
 * The Refresh Token, this is a compacted JWT string.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link OAuthRefreshTokenGrantAuthenticationResult}).
 *
 * @example
 *
 * var tokenRequest = {
 *   refresh_token: 'eyJraWQiOiI2NldURFJVM1paSkNZVFJVVlZTUUw3WEJOIiwic3R0IjoicmVmcmVzaCIsImFsZyI6IkhTMjU2In0.eyJqdGkiOiI1UDNSMTh6RUVveXlUTkszZTQ1YVVlIiwiaWF0IjoxNDcwMjY4MDcyLCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8yNGs3SG5ET3o0dFE5QVJzQnRQVU42Iiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy8yRWRHb3htbGpuODBlRHZjM0JzS05EIiwiZXhwIjoxNDcwMzU0NDcyfQ.P0nswcR4FgHxYILZZP8uqwGGzI3Jym5Co8YkntYjoTI'
 * };
 *
 * authenticator.authenticate(tokenRequest, function(err, oAuthRefreshTokenGrantAuthenticationResult) {
 *   oAuthRefreshTokenGrantAuthenticationResult.getAccount(function(err, account){
 *     console.log(
 *      'The new access token for ' + account.email + ' is: ' +
 *      oAuthRefreshTokenGrantAuthenticationResult.accessTokenResponse.access_token
 *     );
 *   });
 * });
 */
OAuthRefreshTokenGrantAuthenticator.prototype.authenticate = function authenticate(data,callback) {
  var application = this.application;
  if(arguments.length !==2 ){
    throw new Error('Must call authenticate with (data,callback)');
  }else{
    var href = application.href + '/oauth/token';
    var formData = {
      grant_type: 'refresh_token',
      refresh_token: data.refresh_token
    };
    application.dataStore.createResource(href,{form:formData},function(err,data){
      if(err){
        return callback(err);
      }
      try {
        callback(null,new OAuthRefreshTokenGrantAuthenticationResult(application,data));
      } catch (err) {
        callback(err);
      }
    });
  }
};

module.exports = {
  authenticator: OAuthRefreshTokenGrantAuthenticator,
  authenticationResult: OAuthRefreshTokenGrantAuthenticationResult
};
