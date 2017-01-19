'use strict';

var utils = require('../utils');

/**
 * @constructor
 *
 * @description
 *
 * Encapsulates the access token response from an application's `/oauth/token`
 * endpoint.  This is a base class which is extended by
 * {@link OAuthPasswordGrantAuthenticationResult} and {@link OAuthClientCredentialsAuthenticationResult}.
 *
 * @param {Client} client
 * An initialized Stormpath Client for the tenant the issued the token.
 *
 * @param {AccessTokenResponse} accessTokenResponse
 * The access token response from the Stormpath REST API.
 */
function StormpathAccessTokenAuthenticationResult(client, data) {
  if (!(this instanceof StormpathAccessTokenAuthenticationResult)) {
    return new StormpathAccessTokenAuthenticationResult(client,data);
  }

  Object.defineProperty(this, 'client', {
    enumerable: false,
    value: client
  });

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      this[key] = data[key];
    }
  }

  /**
   * @name StormpathAccessTokenAuthenticationResult#expandedJwt
   *
   * @description
   *
   * An object that allows you to inspect the body, claims, and header of the
   * access token.
   *
   * @type {Object}
   */
}

StormpathAccessTokenAuthenticationResult.prototype.account = null;

StormpathAccessTokenAuthenticationResult.prototype.jwt = null;

StormpathAccessTokenAuthenticationResult.prototype.expandedJwt = null;

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
StormpathAccessTokenAuthenticationResult.prototype.getAccount = function getAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  this.client.getAccount(this.account.href, args.options, require('../resource/Account'), args.callback);
};

StormpathAccessTokenAuthenticationResult.prototype.getApplication = function getApplication(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  this.client.getApplication(this.application.href, args.options, require('../resource/Application'), args.callback);
};

module.exports = StormpathAccessTokenAuthenticationResult;
