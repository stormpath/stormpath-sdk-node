'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function DirectoryChildResource() {
  DirectoryChildResource.super_.apply(this, arguments);
}
utils.inherits(DirectoryChildResource, InstanceResource);

DirectoryChildResource.prototype._applyCustomDataUpdatesIfNecessary = function applyCustomDataUpdatesIfNecessary(cb){
  if (!this.customData){
    return cb();
  }

  if (this.customData._hasReservedFields()){
    this.customData = this.customData._deleteReservedFields();
  }

  if (this.customData._hasRemovedProperties()){
    return this.customData._deleteRemovedProperties(cb);
  }

  return cb();
};

DirectoryChildResource.prototype._createGroupMembership = function createGroupMembership(account, group, options, callback) {
  var href = '/groupMemberships';

  var membership = {
    account: {
      href: account.href
    },
    group: {
      href: group.href
    }
  };

  return this.dataStore.createResource(href, options, membership, require('./GroupMembership'), callback);
};

DirectoryChildResource.prototype.getDirectory = function getDirectoryChildResourceDirectory(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.directory.href, options, require('./Directory'), callback);
};

DirectoryChildResource.prototype.getTenant = function getDirectoryChildResourceTenant(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.tenant.href, options, require('./Tenant'), callback);
};

DirectoryChildResource.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.customData.href, options, require('./CustomData'), callback);
};

module.exports = DirectoryChildResource;
