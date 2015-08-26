'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function DirectoryChildResource() {
  DirectoryChildResource.super_.apply(this, arguments);
}
utils.inherits(DirectoryChildResource, InstanceResource);

DirectoryChildResource.prototype._applyCustomDataUpdatesIfNecessary = function applyCustomDataUpdatesIfNecessary(cb){
  var self = this;
  if (!self.customData){
    return cb();
  }

  if (self.customData._hasReservedFields()){
    self.customData = self.customData._deleteReservedFields();
  }

  if (self.customData._hasRemovedProperties()){
    return self.customData._deleteRemovedProperties(cb);
  }

  return cb();
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

DirectoryChildResource.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.customData.href, options, require('./CustomData'), callback);
};

module.exports = DirectoryChildResource;
