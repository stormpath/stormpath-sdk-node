'use strict';

var utils = require('../utils');

/**
 * @class AccessToken
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
 * - {@link Client#getAccessToken Client.getAccessToken()
 * - {@link Account#getAccessTokens Account.getAccessTokens()}
 *
 * For a high-level overview of token management, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#introduction-to-token-based-authentication Introduction to Token-Based Authentication}.
 *
 * To revoke a access token, invoke the `delete()` method on an instance of
 * this class.
 *
 * @augments {InstanceResource}
 *
 * @param {Object} accessTokenResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function AccessToken() {
  AccessToken.super_.apply(this, arguments);
}

// TODO: implement getAccount(), getRefreshToken()

utils.inherits(AccessToken, require('./InstanceResource'));

module.exports = AccessToken;
