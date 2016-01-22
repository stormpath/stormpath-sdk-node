'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Directory() {
  Directory.super_.apply(this, arguments);
}
utils.inherits(Directory, InstanceResource);

Directory.prototype.getAccounts = function getDirectoryAccounts(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.accounts.href, options, require('./Account'), callback);
};

Directory.prototype.getAccountCreationPolicy = function getAccountCreationPolicy(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.accountCreationPolicy.href, options, require('./InstanceResource'), callback);
};

Directory.prototype.getPasswordPolicy = function getPasswordPolicy(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.passwordPolicy.href, options, require('./PasswordPolicy'), callback);
};

Directory.prototype.createAccount = function createDirectoryAccount(/* account, [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var account = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.createResource(this.accounts.href, options, account, require('./Account'), callback);
};

Directory.prototype.getGroups = function getDirectoryGroups(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.groups.href, options, require('./Group'), callback);
};

Directory.prototype.createGroup = function createDirectoryGroup(/* group, [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var group = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.createResource(this.groups.href, options, group, require('./Group'), callback);
};

Directory.prototype.getTenant = function getDirectoryTenant(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.tenant.href, options, require('./Tenant'), callback);
};

Directory.prototype.getProvider = function getProvider(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!this.provider){
    return callback();
  }

  function providerFactory(provider, dataStore) {
    var providerName = 'Provider';

    if (provider.providerId === 'saml') {
      providerName = 'SamlProvider';
    }

    var ProviderType = require('./' + providerName);

    return new ProviderType(provider, dataStore);
  }

  return this.dataStore.getResource(this.provider.href, options, providerFactory, callback);
};

Directory.prototype.getOrganizations = function getOrganizations(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.organizations.href, options, require('./Organization'), callback);
};

Directory.prototype.getOrganizationMappings = function getOrganizationMappings(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.organizationMappings.href, options, require('./OrganizationAccountStoreMapping'), callback);
};

Directory.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.customData.href, options, require('./CustomData'), callback);
};

module.exports = Directory;
