'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class AccountStoreMapping
 *
 * @description
 *
 * Encapsulates an Account Store Mapping Resource, and is a base class for
 * {@link ApplicationAccountStoreMapping} and {@link OrganizationAccountStoreMapping}.
 * For full documentation of the PasswordPolicy resource, please see
 * [REST API Reference: Account Store Mapping](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#account-store-mapping).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#getAccountStoreMappings Application.getAccountStoreMappings()}
 * - {@link Organization#getAccountStoreMappings Organization.getAccountStoreMappings()}
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
 * The JSON representation of this resource.
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
 * {@link Group}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link AccountStoreMapping} during this request.
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

/**
 * This is not necessary, application can be passed to createAccountStoreMapping().  Remove in 1.0
 *
 * @private
 */
AccountStoreMapping.prototype.setApplication = function setAccountStoreMappingApplication(application) {
  this.application = { href: application.href };
};

/**
 * This is not necessary, accountStore can be passed to createAccountStoreMapping().  Remove in 1.0
 *
 * @private
 */
AccountStoreMapping.prototype.setAccountStore = function setAccountStoreMappingAccountStore(accountStore) {
  this.accountStore = { href: accountStore.href };
  return this;
};

module.exports = AccountStoreMapping;
