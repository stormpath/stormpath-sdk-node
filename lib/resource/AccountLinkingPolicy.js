'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class AccountLinkingPolicy
 *
 * @description
 *
 * Encapsulates an AccountLinkingPolicy resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Account LinkingPolicy](https://docs.stormpath.com/rest/product-guide/latest/reference.html#account-linking-policy).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#getAccountLinkingPolicy Application.getAccountLinkingPolicy()}
 * - {@link Organization#getAccountLinkingPolicy Organization.getAccountLinkingPolicy()}
 *
 * Furthermore, an Account Linking Policy cannot be created or deleted from the SDK. Instead, it is
 * automatically created for all {@link Application} and {@link Organization} resources,
 * but can then be modified.
 *
 * @augments {InstanceResource}
 *
 * @param {Object} AccountLinkingPolicyResource
 *
 * The JSON representation of this resource.
 *
 */
function AccountLinkingPolicy() {
  AccountLinkingPolicy.super_.apply(this, arguments);
}

utils.inherits(AccountLinkingPolicy, InstanceResource);

/**
* Retrieves this account linking policy's associated tenant.
*
* @param {ExpansionOptions} options
* Options for retrieving linked resources of the {@link Tenant} during this request.
*
* @param {Function} callback
* The callback that will be called with the parameters (err, {@link Tenant}).
*/
AccountLinkingPolicy.prototype.getTenant = function getTenant(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

// Removes the inherited delete method. This resource cannot be deleted manually!
AccountLinkingPolicy.prototype.delete = undefined;

module.exports = AccountLinkingPolicy;
