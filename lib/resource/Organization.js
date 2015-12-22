'use strict';

var async = require('async');
var utils = require('../utils');

var OrganizationAccountStoreMapping = require('./OrganizationAccountStoreMapping');

function Organization() {
  Organization.super_.apply(this, arguments);
}

utils.inherits(Organization, require('./InstanceResource'));

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
