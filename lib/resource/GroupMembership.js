'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class GroupMembership
 *
 * @description
 *
 * Encapsulates a GroupMembership resource. For full documentation of this
 * resource, please see
 * [REST API Reference: Group Membership](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#group-membership).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#getGroupMemberships Account.getGroupMemberships()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} groupMembershipResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
function GroupMembership() {
  GroupMembership.super_.apply(this, arguments);
}
utils.inherits(GroupMembership, InstanceResource);

GroupMembership.prototype.getAccount = function getGroupMembershipAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

GroupMembership.prototype.getGroup = function getGroupMembershipGroup(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.group.href, args.options, require('./Group'), args.callback);
};

module.exports = GroupMembership;
