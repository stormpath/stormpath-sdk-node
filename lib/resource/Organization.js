'use strict';

var async = require('async');
var utils = require('../utils');

var Account = require('./Account');
var CustomData = require('./CustomData');
var IdSiteModel = require('./IdSiteModel');
var OrganizationAccountStoreMapping = require('./OrganizationAccountStoreMapping');

function Organization() {
  Organization.super_.apply(this, arguments);
}

utils.inherits(Organization, require('./InstanceResource'));

Organization.prototype.createAccount = function createAccount(/* account, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);
  return this.dataStore.createResource(this.accounts.href, args.options, args.account, Account, args.callback);
};

Organization.prototype.getAccounts = function getAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, Account, args.callback);
};

Organization.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, CustomData, args.callback);
};

Organization.prototype.getDefaultAccountStoreMapping = function getDefaultAccountStoreMapping(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultAccountStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultAccountStoreMapping.href, args.options, OrganizationAccountStoreMapping, args.callback);
};

Organization.prototype.getDefaultGroupStoreMapping = function getDefaultGroupStoreMapping(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultGroupStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultGroupStoreMapping.href, args.options, OrganizationAccountStoreMapping, args.callback);
};

Organization.prototype.getDefaultAccountStore = function getDefaultAccountStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getDefaultAccountStoreMapping({ expand: 'accountStore' }, function (err, organizationAccountStoreMapping) {
    if (err) {
      return args.callback(err);
    }

    if (!organizationAccountStoreMapping) {
      return args.callback(null, null);
    }

    organizationAccountStoreMapping.getAccountStore(args.options, args.callback);
  });
};

Organization.prototype.getDefaultGroupStore = function getDefaultGroupStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getDefaultGroupStoreMapping({ expand: 'accountStore' }, function (err, organizationAccountStoreMapping) {
    if (err) {
      return args.callback(err);
    }

    if (!organizationAccountStoreMapping) {
      return args.callback(null, null);
    }

    organizationAccountStoreMapping.getAccountStore(args.options, args.callback);
  });
};

Organization.prototype.getGroups = function getGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

Organization.prototype.getIdSiteModel = function getIdSiteModel(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.idSiteModel.href, args.options, IdSiteModel, args.callback);
};

Organization.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountStoreMappings.href, args.options, OrganizationAccountStoreMapping, args.callback);
};

Organization.prototype.createAccountStoreMapping = function createAccountStoreMapping(/* mapping, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['mapping', 'options', 'callback']);

  args.mapping = new OrganizationAccountStoreMapping(args.mapping).setOrganization(this);

  return this.dataStore.createResource('/organizationAccountStoreMappings', args.options, args.mapping, OrganizationAccountStoreMapping, args.callback);
};

Organization.prototype.createAccountStoreMappings = function createAccountStoreMappings(mappings, callback) {
  async.mapSeries(mappings, function(mapping, next) {
    this.createAccountStoreMapping(mapping, next);
  }.bind(this), callback);
};

module.exports = Organization;
