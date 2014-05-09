'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

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

  if (!Class) {
    throw new Error('Unknown resource type of Account Store in Account Store Mapping, href:' + data.href);
  }

  return require('./ResourceFactory').instantiate(Class, data, null, dataStore);
}

AccountStoreClassFactory.super_ = InstanceResource;

AccountStoreMapping.prototype.getApplication = function getApplication(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.application.href, options, require('./Application'), callback);
};
AccountStoreMapping.prototype.getAccountStore = function getAccountStore(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accountStore.href, options, AccountStoreClassFactory, callback);
};

AccountStoreMapping.prototype.setApplication = function setAccountStoreMappingApplication(application) {
  this.application = { href: application.href };
};

AccountStoreMapping.prototype.setAccountStore = function setAccountStoreMappingAccountStore(accountStore) {
  this.accountStore = { href: accountStore.href };
};

module.exports = AccountStoreMapping;