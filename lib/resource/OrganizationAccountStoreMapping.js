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
 * between an {@link Organization} and a {@link Directory} or {@link Group}.
 *
 * This object should not be constructed manually, it should be retrieved by a
 * getter method, such as
 * {@link Organization#getAccountStoreMappings Organization.getAccountStoreMappings()}.
 *
 */
function OrganizationAccountStoreMapping() {
  OrganizationAccountStoreMapping.super_.apply(this, arguments);
}

utils.inherits(OrganizationAccountStoreMapping, AccountStoreMapping);

OrganizationAccountStoreMapping.prototype.getOrganization = function getOrganization(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organization.href, args.options, require('./Organization'), args.callback);
};

OrganizationAccountStoreMapping.prototype.setOrganization = function setOrganization(organization) {
  this.organization = { href: organization.href };
  return this;
};

module.exports = OrganizationAccountStoreMapping;
