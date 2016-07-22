'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Directory
 *
 * @description
 *
 * Encapsulates a Directory resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Directory](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#directory).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#getDirectory Account.getDirectory()}
 * - {@link AccountStoreMapping#getAccountStore AccountStoreMapping.getAccountStore()}
 * - {@link Client#getDirectory Client.getDirectory()}
 * - {@link Group#getDirectory Group.getDirectory()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} directoryResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
function Directory() {
  Directory.super_.apply(this, arguments);
}

utils.inherits(Directory, InstanceResource);

Directory.prototype.getAccounts = function getDirectoryAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

Directory.prototype.getAccountCreationPolicy = function getAccountCreationPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountCreationPolicy.href, args.options, require('./InstanceResource'), args.callback);
};

/**
 * Get the {@link PasswordPolicy} resource of this Directory resource.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link PasswordPolicy}).
 */
Directory.prototype.getPasswordPolicy = function getPasswordPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.passwordPolicy.href, args.options, require('./PasswordPolicy'), args.callback);
};

Directory.prototype.createAccount = function createDirectoryAccount(/* account, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);
  return this.dataStore.createResource(this.accounts.href, args.options, args.account, require('./Account'), args.callback);
};

Directory.prototype.getGroups = function getDirectoryGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

Directory.prototype.createGroup = function createDirectoryGroup(/* group, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback']);
  return this.dataStore.createResource(this.groups.href, args.options, args.group, require('./Group'), args.callback);
};

Directory.prototype.getTenant = function getDirectoryTenant(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

Directory.prototype.getProvider = function getProvider(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.provider){
    return args.callback();
  }

  function providerFactory(provider, dataStore) {
    var providerName = 'Provider';

    if (provider.providerId === 'saml') {
      providerName = 'SamlProvider';
    }

    var ProviderType = require('./' + providerName);

    return new ProviderType(provider, dataStore);
  }

  return this.dataStore.getResource(this.provider.href, args.options, providerFactory, args.callback);
};

Directory.prototype.getOrganizations = function getOrganizations(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organizations.href, args.options, require('./Organization'), args.callback);
};

Directory.prototype.getOrganizationMappings = function getOrganizationMappings(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organizationMappings.href, args.options, require('./OrganizationAccountStoreMapping'), args.callback);
};

Directory.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = Directory;
