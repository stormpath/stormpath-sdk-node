'use strict';
var utils = require('../utils');

var AccountStoreMapping = require('./AccountStoreMapping');

function OrganizationAccountStoreMapping() {
  OrganizationAccountStoreMapping.super_.apply(this, arguments);
}
utils.inherits(OrganizationAccountStoreMapping, AccountStoreMapping);

OrganizationAccountStoreMapping.prototype.getOrganization = function getOrganization(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.organization.href, options, require('./Organization'), callback);
};

OrganizationAccountStoreMapping.prototype.setOrganization = function setOrganization(organization) {
  this.organization = { href: organization.href };
  return this;
};

module.exports = OrganizationAccountStoreMapping;