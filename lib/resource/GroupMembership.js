'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function GroupMembership() {
  GroupMembership.super_.apply(this, arguments);
}
utils.inherits(GroupMembership, InstanceResource);

GroupMembership.prototype.getAccount = function getGroupMembershipAccount(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.account.href, options, require('./Account'), callback);
};

GroupMembership.prototype.getGroup = function getGroupMembershipGroup(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.group.href, options, require('./Group'), callback);
};

module.exports = GroupMembership;
