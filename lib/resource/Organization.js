'use strict';

var async = require('async');
var utils = require('../utils');

var OrganizationAccountStoreMapping = require('./OrganizationAccountStoreMapping');

function Organization() {
  Organization.super_.apply(this, arguments);
}

utils.inherits(Organization, require('./InstanceResource'));

Organization.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountStoreMappings.href, args.options, OrganizationAccountStoreMapping, args.callback);
};

Organization.prototype.createAccountStoreMapping = function createAccountStoreMapping(mapping, callback) {
  var args = Array.prototype.slice.call(arguments);
  var options = (args.length > 2) ? args[1] : null; // TODO: Refactor this... Doesn't make sense.
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
