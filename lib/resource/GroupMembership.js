'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

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
