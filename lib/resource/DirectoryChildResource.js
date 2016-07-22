'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class DirectoryChildResource
 */
function DirectoryChildResource() {
  DirectoryChildResource.super_.apply(this, arguments);
}
utils.inherits(DirectoryChildResource, InstanceResource);

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

/**
 * Gets the directory resource that is a parent of resource.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link Directory}).
 */
DirectoryChildResource.prototype.getDirectory = function getDirectoryChildResourceDirectory(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.directory.href, args.options, require('./Directory'), args.callback);
};

/**
 * Gets the Stormpath tenant resource that owns this resource.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link Tenant}).
 */
DirectoryChildResource.prototype.getTenant = function getDirectoryChildResourceTenant(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

/**
 * Gets the custom data object for this resource.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link CustomData}).
 */
DirectoryChildResource.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = DirectoryChildResource;
