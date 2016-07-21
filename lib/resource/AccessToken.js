'use strict';

var utils = require('../utils');

/**
 * @class AccessToken
 *
 * @description
 *
 * This object encapsulates a Stormpath OAuth Access Token Resource.
 *
 * This class should not be constructed manually. Instead, an instance of this
 * result should be obtained from {@link Client#getAccessToken
 * Client.getAccessToken()} or {@link Account#getAccessTokens
 * Account.getAccessTokens()}.
 *
 * For a high-level overview of token management, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#introduction-to-token-based-authentication Introduction to Token-Based Authentication}.
 *
 * To revoke an access token, invoke the `delete()` method on an instance of
 * this class.
 *
 * @augments {InstanceResource}
 *
 * @param {Object} accessTokenData
 * The raw JSON data from the account resource, as retrieved from the Stormpath
 * REST API.
 */
function AccessToken() {
  AccessToken.super_.apply(this, arguments);
}

// TODO: implement getAccount(), getRefreshToken()

utils.inherits(AccessToken, require('./InstanceResource'));

module.exports = AccessToken;
