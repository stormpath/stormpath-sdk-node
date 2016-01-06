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
  var args = Array.prototype.slice.call(arguments);

  var account = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.createResource(this.accounts.href, options, account, Account, callback);
};

Organization.prototype.getAccounts = function getAccounts(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.accounts.href, options, Account, callback);
};

Organization.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.customData.href, options, CustomData, callback);
};

Organization.prototype.getDefaultAccountStore = function getDefaultAccountStore(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!this.defaultAccountStoreMapping) {
    return callback();
  }

  return this.dataStore.getResource(this.defaultAccountStoreMapping.href, options, OrganizationAccountStoreMapping, callback);
};

Organization.prototype.getDefaultGroupStore = function getDefaultGroupStore(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!this.defaultGroupStoreMapping) {
    return callback();
  }

  return this.dataStore.getResource(this.defaultGroupStoreMapping.href, options, OrganizationAccountStoreMapping, callback);
};

Organization.prototype.getGroups = function getGroups(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.groups.href, options, require('./Group'), callback);
};

Organization.prototype.getIdSiteModel = function getIdSiteModel(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.idSiteModel.href, options, IdSiteModel, callback);
};

Organization.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.accountStoreMappings.href, options, OrganizationAccountStoreMapping, callback);
};

Organization.prototype.createAccountStoreMapping = function createAccountStoreMapping(mapping, callback) {
  var args = Array.prototype.slice.call(arguments);
  var options = (args.length > 2) ? args[1] : null;
  mapping = new OrganizationAccountStoreMapping(mapping).setOrganization(this);
  return this.dataStore.createResource('/organizationAccountStoreMappings', options, mapping, OrganizationAccountStoreMapping, callback);
};

Organization.prototype.createAccountStoreMappings = function createAccountStoreMappings(mappings,callback){
  var self = this;
  async.mapSeries(mappings,function(mapping,next){
    self.createAccountStoreMapping(mapping,next);
  },callback);
};

module.exports = Organization;
