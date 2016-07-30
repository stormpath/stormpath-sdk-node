'use strict';

var nJwt = require('njwt');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class AuthenticationResult
 *
 * @description
 * Encapsulates an authentication result, and provides a method for getting the
 * account that was authenticated. An Authentication Result is not constructed
 * manually, instead it is returned from one of these methods:
 *
 * - {@link Application#authenticateAccount Application.authenticateAccount()}
 * - {@link Application#authenticateApiRequest Application.authenticateApiRequest()}
 *
 * @param {Object} authenticationResult
 * The raw JSON data of the Application resource, as retrieved from the
 * Stormpath REST API.
 */
function AuthenticationResult() {
  AuthenticationResult.super_.apply(this, arguments);
  Object.defineProperty(this, 'application', { enumerable:false, writable:true });
  Object.defineProperty(this, 'forApiKey', { enumerable:false, writable:true });
  Object.defineProperty(this, 'ttl', { enumerable:false, writable:true, value: 3600 });
}

utils.inherits(AuthenticationResult, InstanceResource);

/**
 * Retrieves the account resource of the user that has been authenticated.
 *
 * @param {ExpansionOptions} [options]
 * For retrieving linked resources of the {@link Account} during this request.
 *
 * @param {Function} Callback
 * Callback function, will be called with (err, {@link Account account}).
 */
AuthenticationResult.prototype.getAccount = function getAuthenticationResultAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

/**
 * Create a signed JWT that can be used to authenticate this account in the
 * future with one of these methods:
 *
 * - {@link JwtAuthenticator#authenticate JwtAuthenticator.authenticate()}
 * - {@link Application#authenticateApiRequest Application.authenticateApiRequest()}
 *
 * The token is tied to the application which generated the authentication
 * result, the `iss` field will the the HREF of the application and the `sub`
 * field will be the ID of the {@link ApiKey} of the {@link Account} that
 * authenticated.
 *
 * **Warning**: Tokens created through this method are not managed by the
 * Stormpath REST API (they are stateless).  If you need Stormpath to track
 * the tokens, please use the {@link OAuthPasswordGrantRequestAuthenticator}
 * to obtain an access token and refresh token for the user.
 *
 * @example
 *
 * var jwt = authenticationResult.getJwt();
 *
 * jwt.setExpiration(new Date('2015-07-01')); // A specific date
 * jwt.setExpiration(new Date().getTime() + (60*60*1000)); // One hour from now
 *
 * // Compact the JWT to a Base64-URL encoded token.
 * var accessToken = jwt.compact();
 *
 * @returns {Jwt}
 */
AuthenticationResult.prototype.getJwt = function getJwt() {
  var secret = this.application.dataStore.requestExecutor
    .options.client.apiKey.secret;

  var jwt = nJwt.create({
    iss: this.application.href,
    sub: this.forApiKey ? this.forApiKey.id : this.account.href,
    jti: utils.uuid()
  }, secret);

  jwt.setExpiration(new Date().getTime() + (this.ttl * 1000));

  return jwt;
};

/**
 * This method calls {@link AuthenticationResult#getJwt getJwt()} to create a
 * JWT for account, and returns it as a Base64-URL encoded token.
 *
 * @example <caption>Get a compacted JWT access token for this account</caption>
 * var accessToken = authenticationResult.getAccessTokenResponse();
 *
 * @example <caption>Access token format</caption>
 * eyJraWQiOiI2NldURFJVM1paSkNZVFJVVlZTUUw3WEJOIiwic3R0IjoiYWNjZXNzIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiIzV0llS3N1SmR6YWR5YzN4U1ltc1l6IiwiaWF0IjoxNDY5ODMzNzQ3LCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8yNGs3SG5ET3o0dFE5QVJzQnRQVU42Iiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy8yRWRHb3htbGpuODBlRHZjM0JzS05EIiwiZXhwIjoxNDY5ODM0MzQ3LCJydGkiOiIzV0llS3BhRWpQSGZMbXk2R0l2Ynd2In0.9J7HvhgJZxvxuE-0PiarTDTFPCVVLR_nvRByULNA01Q
 */

AuthenticationResult.prototype.getAccessToken = function getAccessToken(jwt) {
  return (jwt || this.getJwt()).compact();
};


/**
 * This method calls {@link AuthenticationResult#getJwt getJwt()} to create a
 * JWT for account, and returns as an an OAuth-compatible response body.
 *
 * @example <caption>Get an access token response body for this account.</caption>
 * var responseBody = authenticationResult.getAccessTokenResponse();
 *
 * @example <caption>Response body format</caption>
 * {
 *  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc ...",
 *  "expires_in": 3600,
 *  "token_type": "bearer",
 *  "scope": "given-scope"
 * }
 */
AuthenticationResult.prototype.getAccessTokenResponse = function getAccessTokenResponse(jwt) {
  jwt = jwt || this.getJwt();

  var resp = {
    'access_token': jwt.compact(),
    'token_type': 'Bearer',
    'expires_in': this.ttl
  };

  if(jwt.body.scope){
    resp.scope = jwt.body.scope;
  }

  return resp;
};

/**
 * @name  AuthenticationResult.grantedScopes
 *
 * @type {Array}
 *
 * @description
 *
 * Exists if the authentication result was created from a previously issued
 * OAuth Access Token which has granted scopes, it will be an array of strings
 * which are the granted scopes.
 *
 * @example
 *
 * ['scope-a', 'scope-b']
 */


module.exports = AuthenticationResult;
