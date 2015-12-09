'use strict';

var util = require('util');

var JwtAuthenticationResult = require('../jwt/jwt-authentication-result');


function OAuthPasswordGrantAuthenticationResult(application,data){
  if (!(this instanceof OAuthPasswordGrantAuthenticationResult)) {
    return new OAuthPasswordGrantAuthenticationResult(application,data);
  }
  OAuthPasswordGrantAuthenticationResult.super_.apply(this, arguments);

  this.accessTokenResponse = data;


}
util.inherits(OAuthPasswordGrantAuthenticationResult, JwtAuthenticationResult);

/**
* @class
* @description
*
* Use this authenticator to exchange a username and password for an access token
* and refresh token pair.
*
* @param {Application} application The Stormpath Application that will be used
* for the authentication attempt.
*
* @example
* var stormpath = require('stormpath');
* var client = new stormpath.Client();
* var authenticator;
* client.getApplication('myAppHref', function(err, application){
*   authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
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
 * @param  {AuthenticationRequest} authentication data (username/email, password)
 * @param  {Function} callback authentication result callback
 * @return {[type]}            [description]
 * @example
 * authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
 * authenticator.authenticate({
 *   username: 'email or username',
 *   password: 'the password'
 * }, function(err, authenticationResult){
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

module.exports = {
  authenticator: OAuthPasswordGrantRequestAuthenticator,
  authenticationResult: OAuthPasswordGrantAuthenticationResult
};
