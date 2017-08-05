'use strict';

var utils = require('../utils');
var Resource = require('./Resource');
var SaveableMixin = require('./mixins/SaveableMixin');

/**
 * @class OAuthPolicy
 *
 * @augments Resource
 * @mixes SaveableMixin
 *
 * @description
 *
 * Encapsulates a OAuth Policy resource of an {@link Application}. For full
 * documentation of this resource please see
 * [REST API Reference: OAuth Policy](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#oauth-policy).
 *
 * For a high level overview of this feature, please see
 * [How Token-Based Authentication Works](https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#how-token-based-authentication-works).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#getOAuthPolicy Application.getOAuthPolicy()}
 *
 * @param {Object} oAuthPolicyResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
function OAuthPolicy() {
  OAuthPolicy.super_.apply(this, arguments);
}

utils.inherits(OAuthPolicy, Resource);
utils.applyMixin(OAuthPolicy, SaveableMixin);

module.exports = OAuthPolicy;
