'use strict';

var DirectoryChildResource = require('./DirectoryChildResource');
var utils = require('../utils');

function Group() {
  Group.super_.apply(this, arguments);
}

utils.inherits(Group, DirectoryChildResource);

Group.prototype.addAccount = function addGroupAccount(/* accountOrAccountHref, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);

  if (typeof args.account === 'string') {
    args.account = {
      href: args.account
    };
  }

  return this._createGroupMembership(args.account, this, args.options, args.callback);
};

Group.prototype.getAccounts = function getGroupAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

Group.prototype.getAccountMemberships = function getGroupAccountMemberships(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountMemberships.href, args.options, require('./GroupMembership'), args.callback);
};

Group.prototype.save = function saveAccount(){
  var self = this;
  var args = arguments;
  self._applyCustomDataUpdatesIfNecessary(function(){
    Group.super_.prototype.save.apply(self, args);
  });
};

module.exports = Group;
