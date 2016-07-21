'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class AccountStoreMapping
 *
 * @description
 *
 * Encapsulates an Account Store Mapping Resource, and is a base class for
 * {@link ApplicationAccountStoreMapping} and
 * {@link OrganizationAccountStoreMapping}. It should not be constructed
 * manually.
 *
 * The properties of this resource are documented here:
 * [REST API Reference: Account Store Mapping](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#account-store-mapping).
 *
 *
 * An account store mapping can exist in two ways:
 *
 * - Between an {@link Application} and a {@link Directory}, {@link Group}, or
 *   {@link Organization}.
 *
 * - Between an {@link Organization} and a {@link Directory} or {@link Group}.
 *
 * For more information about account store mappings, please see
 * [Modeling Your User Base](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#modeling-your-user-base).
 *
 * @param {object} accountStoreMappingResource
 *
 * The JSON representation of this resource, from the Stormpath REST API.
 * See [REST API Reference: Account Store Mapping](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#account-store-mapping).
 *
 */
function AccountStoreMapping() {
  AccountStoreMapping.super_.apply(this, arguments);
}

utils.inherits(AccountStoreMapping, InstanceResource);

function AccountStoreClassFactory(data, dataStore) {
  var Class = null;
  if (!data || !data.href) {
    Class = InstanceResource;
  }

  if (/\/groups/.test(data.href)) {
    Class = require('./Group');
  }

  if (/\/directories/.test(data.href)) {
    Class = require('./Directory');
  }

  if (/\/organizations/.test(data.href)) {
    Class = require('./Organization');
  }

  if (!Class) {
    throw new Error('Unknown resource type of Account Store in Account Store Mapping, href:' + data.href);
  }

  return require('./ResourceFactory').instantiate(Class, data, null, dataStore);
}

AccountStoreClassFactory.super_ = InstanceResource;

AccountStoreMapping.prototype.getApplication = function getApplication(/* [options,] callback */) {
  /*
    This has been moved to ApplicationAccountStoreMapping, should be removed.
    @TODO Version 1.0
  */
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.application.href, args.options, require('./Application'), args.callback);
};

/**
 * @description
 *
 * Get the Account Store of this mapping. For an
 * {@link ApplicationAccountStoreMapping} this will be a {@link Directory},
 * {@link Group}, or {@link Organization}. For an
 * {@link OrganizationAccountStoreMapping} this will be a {@link Directory} or
 * {@link Group}
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request, e.g. to expand properties on the Account Store.
 *
 * @param {Function} callback
 * The callback to call when the operation is complete. Will be called with
 * (err, <{@link Directory}|{@link Group}>).
 *
 */
AccountStoreMapping.prototype.getAccountStore = function getAccountStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountStore.href, args.options, AccountStoreClassFactory, args.callback);
};

AccountStoreMapping.prototype.setApplication = function setAccountStoreMappingApplication(application) {
  /*
    This has been moved to ApplicationAccountStoreMapping, should be removed.
    @TODO Version 1.0
  */
  this.application = { href: application.href };
};

AccountStoreMapping.prototype.setAccountStore = function setAccountStoreMappingAccountStore(accountStore) {
  this.accountStore = { href: accountStore.href };
  return this;
};

module.exports = AccountStoreMapping;
