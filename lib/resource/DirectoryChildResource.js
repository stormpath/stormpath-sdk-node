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

/**
 * Creates a group membership for a specific account.
 *
 * @private
 *
 * @param {Account|Object} account
 * An existing instance of {@link Account}, or an object literal with
 * an `href` property that identifies the account to add.
 *
 * @param {Group|Object} group
 * An existing instance of the group to create membership in, or an object literal with
 * an `href` property that identifies the group to use.
 *
 * @param {Object} options
 * Group membership options.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link GroupMembership}).
 */
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
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Directory} during this request.
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
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Tenant} during this request.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link Tenant}).
 */
DirectoryChildResource.prototype.getTenant = function getDirectoryChildResourceTenant(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

/**
 * Gets the {@link CustomData} object for this resource.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link CustomData}).
 */
DirectoryChildResource.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = DirectoryChildResource;
