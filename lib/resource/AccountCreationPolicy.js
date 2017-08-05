var Resource = require('./Resource');
var SaveableMixin = require('./mixins/SaveableMixin');
var utils = require('../utils');

/**
 * @class AccountCreationPolicy
 *
 * @augments Resource
 * @mixes SaveableMixin
 *
 * @description
 * Encapsulates the account creation policy of a {@link Directory}. For full documentation of the this resource, please see
 * [REST API Reference: Account Creation Policy](https://docs.stormpath.com/rest/product-guide/latest/reference.html#account-creation-policy).
 *
 * For a high-level overview account verification workflows, please see:
 * - [How to Verify an Account’s Email](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#how-to-verify-an-account-s-email).
 * - [Customizing Stormpath Emails via REST](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#customizing-stormpath-emails-via-rest).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Directory#getAccountCreationPolicy Directory.getAccountCreationPolicy()}
 *
 * @param {Object} accountCreationPolicyResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */

function AccountCreationPolicy() {
  AccountCreationPolicy.super_.apply(this, arguments);
}

utils.inherits(AccountCreationPolicy, Resource);
utils.applyMixin(AccountCreationPolicy, SaveableMixin);

module.exports = AccountCreationPolicy;
