'use strict';
var utils = require('../utils');
var DirectoryChildResource = require('./DirectoryChildResource');

function Account() {
  Account.super_.apply(this, arguments);
}
utils.inherits(Account, DirectoryChildResource);

Account.prototype.getGroups = function getAccountGroups(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.groups.href, options, require('./Group'), callback);
};

Account.prototype.addToGroup = function addAccountToGroup(/* group, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var group = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self._createGroupMembership(self, group, options, callback);
};

module.exports = Account;
