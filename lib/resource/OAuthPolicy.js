'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 *
 * @class OAuthPolicy
 *
 * @param {Object} oAuthPolicyData
 * The raw JSON data of this resource, as retrieved from the Stormpath REST API.
 *
 * @description
 *
 * Encapsualtes the OAuth Policy of an {@link Application}. For more information
 * about the OAuth features of Stormpath Applications Authentication, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#how-token-based-authentication-works How Token-Based Authentication Works}.
 * and
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#oauth-token REST API Refernce: Application / Application Endpoints / OAuth Token}
 *
 * This object does not need to be manually constructed.  It should be obtained
 * from {@link Application#getOAuthPolicy Application.getOAuthPolicy()}
 *
 * @property {String} accessTokenTtl
 * The maximum age of the acces token, at which point the token will expire and
 * can no longer be used for authentication.
 * [ISO8060 Duration Formatted String](https://en.wikipedia.org/wiki/ISO_8601#Durations).
 *
 *
 * @property {String} refreshTokenTtl
 * The maximum age of the refresh token, at which point the token will expire
 * and can no longer be used for getting new access tokens.
 * [ISO8060 Duration Formatted String](https://en.wikipedia.org/wiki/ISO_8601#Durations).
 *
 */
function OAuthPolicy() {
  OAuthPolicy.super_.apply(this, arguments);
}

utils.inherits(OAuthPolicy, InstanceResource);


module.exports = OAuthPolicy;
