'use strict';

var utils = require('../utils');
var DeletableMixin = require('./mixins/DeletableMixin');

/**
 * @class AccessToken
 *
 * @augments Resource
 * @mixes DeletableMixin
 *
 * @description
 *
 * Encapsulates a Stormpath OAuth Access Token Resource. For full
 * documentation of this resource, please see
 * [REST API Reference: Access tokens](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#access-tokens).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - From the client, using the access token stormpath href {@link Client#getAccessToken Client.getAccessToken()}
 * - From the account, {@link Account#getAccessTokens Account.getAccessTokens()}
 * - From a JWT authentication, {@link JwtAuthenticator#authenticate JwtAuthenticator}
 * - From an OAuth 2.0 password grant authentication, {@link OAuthPasswordGrantRequestAuthenticator#authenticate OAuthPasswordGrantRequestAuthenticator}
 *
 * For a high-level overview of token management, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#introduction-to-token-based-authentication Introduction to Token-Based Authentication}.
 *
 * To revoke a access token, invoke the `delete()` method on an instance of
 * this class.
 *
 * @param {Object} accessTokenResource
 *
 * The JSON representation of this resource, retrieved from the Stormpath REST API.
 */
function AccessToken() {
  AccessToken.super_.apply(this, arguments);
}

// TODO: implement getRefreshToken()

utils.inherits(AccessToken, require('./Resource'));
utils.applyMixin(AccessToken, DeletableMixin);

/**
* Gets and returns the account associated with this access token.
*
* @param {ExpansionOptions=} opts Options for expanding the fetched Account
*
* @param {Function} callback The function to call after the operation is finished.
* It is called with (err, {@link Account}).
*/
AccessToken.prototype.getAccount = function getAccount(/* [opts,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

module.exports = AccessToken;
