'use strict';

var utils = require('../utils');

/**
 * @class RefreshToken
 *
 * @description
 *
 * This object encapsulates a Stormpath OAuth Refresh Token Resource.
 *
 * This class should not be constructed manually. Instead, an instance of this
 * result should be obtained from {@link Client#getRefreshToken
 * Client.getRefreshToken()} or {@link Account#getRefreshTokens
 * Account.getRefreshTokens()}.
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
function RefreshToken() {
  RefreshToken.super_.apply(this, arguments);
}

utils.inherits(RefreshToken, require('./InstanceResource'));

module.exports = RefreshToken;
