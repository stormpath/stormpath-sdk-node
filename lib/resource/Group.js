'use strict';

var DirectoryChildResource = require('./DirectoryChildResource');
var utils = require('../utils');

/**
 * @class Group
 *
 * @description
 *
 * Encapsulates a Group resource. For full documentation of this resource, please see
 * [REST API Reference: Group](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#group).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Client#getGroup Client.getGroup()}
 * - {@link GroupMembership#getGroup GroupMembership.getGroup()}
 *
 * @augments {InstanceResource}
 *
 * @augments {DirectoryChildResource}
 *
 * @param {Object} groupResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
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

module.exports = Group;
