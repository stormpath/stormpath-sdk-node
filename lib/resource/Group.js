'use strict';
var utils = require('../utils');
var DirectoryChildResource = require('./DirectoryChildResource');

function Group() {
  Group.super_.apply(this, arguments);
}
utils.inherits(Group, DirectoryChildResource);

Group.prototype.getAccounts = function getGroupAccounts(/* options, callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accounts.href, options, require('./Account'), callback);
};

Group.prototype.addAccount = function addGroupAccount(/* account, options, callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var account = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self._createGroupMembership(account, self, options, callback);
};

module.exports = Group;
