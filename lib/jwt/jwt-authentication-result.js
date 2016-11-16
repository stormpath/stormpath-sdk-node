'use strict';

var nJwt = require('njwt');
var utils = require('../utils');

/**
 * @typedef {Object} AccessTokenResponse
 *
 * @type {Object}
 *
 * @description
 * The verbatim response from the application's `oauth/token` endpoint.
 *
 * @property {String} access_token
 * The JWT-encoded OAuth2 access token, created by the Stormpath REST API.
 *
 * @property {String} refresh_token
 * The JWT-encoded OAuth2 refresh token, created by the Stormpath REST API.
 *
 * @property {String} token_type
 * The OAuth2 token type, will always be `Bearer`.
 *
 * @property {Number} expires_in
 * The number of seconds that this token is valid for.
 *
 * @property {String} stormpath_access_token_href
 * The HREF of the {@link AccessToken} resource.
 *
 * @example
 *
 * {
 *   "refresh_token": "eyJraWQiOiI2NldURFJVM1paSkNZVFJVVlZTUUw3WEJOIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiI2Q01BQ2Y2YlpEUVZPb3lLZFo3dkxXIiwiaWF0IjoxNDQ5Njk1MjIzLCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8xaDcyUEZXb0d4SEtoeXNLallJa2lyIiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy80V0NDdGMwb0NSRHpRZEFIVlFUcWp6IiwiZXhwIjoxNDU0ODc5MjIzfQ.ctzC_quBRIntssbPYiNqOBtYksGPsdVy4AwuDJKjodM",
 *   "stormpath_access_token_href": "https://api.stormpath.com/v1/accessTokens/6CMACiQgTnjU1e4BpozBxa",
 *   "token_type": "Bearer",
 *   "access_token": "eyJraWQiOiI2NldURFJVM1paSkNZVFJVVlZTUUw3WEJOIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiI2Q01BQ2lRZ1RualUxZTRCcG96QnhhIiwiaWF0IjoxNDQ5Njk1MjIzLCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8xaDcyUEZXb0d4SEtoeXNLallJa2lyIiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy80V0NDdGMwb0NSRHpRZEFIVlFUcWp6IiwiZXhwIjoxNDQ5Njk3MDIzLCJydGkiOiI2Q01BQ2Y2YlpEUVZPb3lLZFo3dkxXIn0.iiETVSG6Fn7vM8K2nG1c7yNoK6AyqOIUAabV-vnR1Z4",
 *   "expires_in": 1800
 * }
 */

/**
 * @typedef {Object} Jwt
 *
 * @description
 *
 * This type is provied by the {@link https://github.com/jwtk/njwt nJwt} library,
 * this type is an object that represents a Json Web Token, allowing you to
 * inspect it's claims.
 */

/**
 * @constructor
 *
 * @description
 *
 * Encapsulates the access token response from an application's `/oauth/token`
 * endpoint.  This is a base class which is extended by
 * {@link OAuthPasswordGrantAuthenticationResult} and {@link OAuthClientCredentialsAuthenticationResult}.
 *
 * @param {Application} application
 * The Stormpath Application that issued the tokens.
 *
 * @param {AccessTokenResponse} accessTokenResponse
 * The access token response from the Stormpath REST API.
 */
function JwtAuthenticationResult(application,data) {
  if (!(this instanceof JwtAuthenticationResult)) {
    return new JwtAuthenticationResult(application,data);
  }

  /**
   * @name JwtAuthenticationResult#stormpathAccessTokenHref
   *
   * @description The HREF of the {@link AccessToken} resource.
   *
   * @type {String}
   */

  /*
    Take all the properties of the data response, and put them
    on this object - but convert underscores to camelcase because
    that's the node way bro.
   */
  Object.keys(data).reduce(function(a,key){
    var newKey = key.replace(/_([A-Za-z])/g, function (g) { return g[1].toUpperCase(); });
    a[newKey] = data[key];
    return a;
  },this);

  /*
    Assign application after the key reduction above,
    otherwise it will get replaced with the object literal
    from the response data.
   */
  this.application = application;
  var apiKey = application.dataStore.requestExecutor.options.client.apiKey;

  /**
   * @name JwtAuthenticationResult#accessToken
   *
   * @description
   *
   * An object that allows you to inspect the body, claims, and header of the
   * access token.
   *
   * @type {Jwt}
   */

  if(this.accessToken){
    this.accessToken = nJwt.verify(this.accessToken, apiKey.secret);
    this.account = {
      href: this.accessToken.body.sub
    };
  }

  /**
   * @name JwtAuthenticationResult#refreshToken
   *
   * @description
   *
   * An object that allows you to inspect the body, claims, and header of the
   * refresh token.  Note:  the `client_credentials` workflow does not use
   * refresh tokens.
   *
   * @type {Jwt}
   */

  if(this.refreshToken){
    this.refreshToken = nJwt.verify(this.refreshToken, apiKey.secret);
  }
}

JwtAuthenticationResult.prototype.account = null;

JwtAuthenticationResult.prototype.jwt = null;

JwtAuthenticationResult.prototype.expandedJwt = null;

/**
 * @function
 *
 * @description Get the account resource of the account that has authenticated.
 *
 * @param {ExpansionOptions} options
 * Options for expanding the fetched {@link Account} resource.
 *
 * @param  {Function} callback
 * The callback to call with the parameters (err, {@link Account}).
 */
JwtAuthenticationResult.prototype.getAccount = function getAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  // Workaround because I don't have access to a stormpath client.
  this.application.dataStore.getResource(this.account.href, args.options, require('../resource/Account'), args.callback);
};

module.exports = JwtAuthenticationResult;
