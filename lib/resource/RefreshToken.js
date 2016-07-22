'use strict';

var utils = require('../utils');

/**
 * @class RefreshToken
 *
 * @description
 *
 * Encapsulates a Stormpath OAuth Refresh Token Resource. For full documentation
 * of this resource, please see
 * [REST API Reference: Refresh Token](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#password-policy).
 * For a high-level overview of token management, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#introduction-to-token-based-authentication Introduction to Token-Based Authentication}.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Client#getRefreshToken Client.getRefreshToken()}
 * - {@link Account#getRefreshTokens Account.getRefreshTokens()}
 *
 * To revoke a refresh token, invoke the `delete()` method on an instance of
 * this class.
 *
 * @augments {InstanceResource}
 *
 * @param {Object} refreshTokenResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function RefreshToken() {
  RefreshToken.super_.apply(this, arguments);
}

utils.inherits(RefreshToken, require('./InstanceResource'));

module.exports = RefreshToken;
