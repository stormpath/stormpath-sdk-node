'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function DirectoryChildResource() {
  DirectoryChildResource.super_.apply(this, arguments);
}
utils.inherits(DirectoryChildResource, InstanceResource);

DirectoryChildResource.prototype.getGroupMemberships = function getGroupMemberships(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.groupMemberships.href, options, require('./GroupMembership'), callback);
};

DirectoryChildResource.prototype._createGroupMembership = function createGroupMembership(account, group, options, callback) {
  var self = this;

  var href = '/groupMemberships';

  var membership = {
    account: {
      href: account.href
    },
    group: {
      href: group.href
    }
  };

  return self.dataStore.createResource(href, options, membership, require('./GroupMembership'), callback);
};

DirectoryChildResource.prototype.getDirectory = function getDirectoryChildResourceDirectory(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.directory.href, options, require('./Directory'), callback);
};

DirectoryChildResource.prototype.getTenant = function getDirectoryChildResourceTenant(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.tenant.href, options, require('./Tenant'), callback);
};

module.exports = DirectoryChildResource;
