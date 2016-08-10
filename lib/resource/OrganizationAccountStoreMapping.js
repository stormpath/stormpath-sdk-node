'use strict';

var utils = require('../utils');
var AccountStoreMapping = require('./AccountStoreMapping');

/**
 * @class
 *
 * @augments {AccountStoreMapping}
 *
 * @description
 *
 * Encapsulates an Organization Account Store Mapping, which represents the link
 * between an {@link Organization} and a {@link Directory} or {@link Group}. For
 * full documentation of this resource, please see
 * [REST API Reference: Account Store Mapping](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#account-store-mapping).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Directory#getOrganizationMappings Directory.getOrganizationMappings()}.
 * - {@link Organization#getAccountStoreMappings Organization.getAccountStoreMappings()}.
 *
 * @param {object} accountStoreMappingResource
 *
 * The JSON representation of this resource.
 *
 */
function OrganizationAccountStoreMapping() {
  OrganizationAccountStoreMapping.super_.apply(this, arguments);
}

utils.inherits(OrganizationAccountStoreMapping, AccountStoreMapping);

/**
 * @description
 *
 * Gets the {@link Organization} that is associated with this account store mapping.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Organization} during this request.
 *
 * @param {Function} callback
 * The callback to call when the operation is complete. Will be called with
 * (err, {@link Organization}).
 */
OrganizationAccountStoreMapping.prototype.getOrganization = function getOrganization(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organization.href, args.options, require('./Organization'), args.callback);
};

/**
 * This is not necessary, organization can be passed to createAccountStoreMapping().  Remove in 1.0
 *
 * @private
 */
OrganizationAccountStoreMapping.prototype.setOrganization = function setOrganization(organization) {
  this.organization = { href: organization.href };
  return this;
};

module.exports = OrganizationAccountStoreMapping;
