'use strict';

var DirectoryChildResource = require('./DirectoryChildResource');
var utils = require('../utils');

function Group() {
  Group.super_.apply(this, arguments);
}
utils.inherits(Group, DirectoryChildResource);

Group.prototype.addAccount = function addGroupAccount(/* accountOrAccountHref, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var account = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (typeof account === 'string') {
    account = {
      href: account
    };
  }

  return self._createGroupMembership(account, self, options, callback);
};

Group.prototype.getAccounts = function getGroupAccounts(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accounts.href, options, require('./Account'), callback);
};

Group.prototype.getAccountMemberships = function getGroupAccountMemberships(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accountMemberships.href, options, require('./GroupMembership'), callback);
};

Group.prototype.save = function saveAccount(){
  var self = this;
  var args = arguments;
  self._applyCustomDataUpdatesIfNecessary(function(){
    Group.super_.prototype.save.apply(self, args);
  });
};

module.exports = Group;
