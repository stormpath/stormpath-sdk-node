'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class GroupMembership
 *
 * @description
 * Encapsulates a GroupMembership resource. For full documentation of this resource, please see
 * [REST API Reference: Group Membership](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#group-membership).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Account#getGroupMemberships Account.getGroupMemberships()}
 *
 * To remove the group membership, call the `delete()` method on an instance of this class.
 *
 * @augments {InstanceResource}
 *
 * @param {Object} groupMembershipResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function GroupMembership() {
  GroupMembership.super_.apply(this, arguments);
}
utils.inherits(GroupMembership, InstanceResource);

/**
 * Retrieves the {@link Account account} resource of this membership.
 *
 * @param {ExpansionOptions} [options]
 * For retrieving linked resources of the {@link Account} during this request.
 *
 * @param {Function} Callback
 * Callback function, will be called with (err, {@link Account account}).
 */
GroupMembership.prototype.getAccount = function getGroupMembershipAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

/**
 * Retrieves the {@link Group group} resource of this membership.
 *
 * @param {ExpansionOptions} [options]
 * For retrieving linked resources of the {@link Group group} during this request.
 *
 * @param {Function} Callback
 * Callback function, will be called with (err, {@link Group group}).
 */
GroupMembership.prototype.getGroup = function getGroupMembershipGroup(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.group.href, args.options, require('./Group'), args.callback);
};

module.exports = GroupMembership;
