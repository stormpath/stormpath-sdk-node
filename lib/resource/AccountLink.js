'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class AccountLink
 *
 * @description
 *
 * Encapsulates an AccountLink resource. For full documentation of this resource,
 * please see
 * [REST API Reference: AccountLink](https://docs.stormpath.com/rest/product-guide/latest/reference.html#account-link).
 *
 * For information about automatically generating account links, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#account-linking-automatic Automatic Account Linking}.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#getAccountLinks Account.getAccountLinks()}
 * - {@link Account#createAccountLink Account.createAccountLink()}
 * - {@link Tenant#createAccountLink Tenant.createAccountLink()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} accountLinkResource
 *
 * The JSON representation of this resource.
 */
function AccountLink() {
  AccountLink.super_.apply(this, arguments);
}

utils.inherits(AccountLink, InstanceResource);

/**
* Retrieves the "left" account of this account link. The "left" and "right"
* designations are purely arbitrary and imply no hierarchy or priority between
* the two.
*
* @param {ExpansionOptions} [options]
* For retrieving linked resources of the query result.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with
* the parameters (err, {@link Account}).
*/
AccountLink.prototype.getLeftAccount = function getLeftAccount(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.leftAccount.href, args.options, require('./Account'), args.callback);
};

/**
* Retrieves the "right" account of this account link. The "left" and "right"
* designations are purely arbitrary and imply no hierarchy or priority between
* the two.
*
* @param {ExpansionOptions} [options]
* For retrieving linked resources of the query result.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with
* the parameters (err, {@link Account}).
*/
AccountLink.prototype.getRightAccount = function getRightAccount(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.rightAccount.href, args.options, require('./Account'), args.callback);
};

module.exports = AccountLink;
