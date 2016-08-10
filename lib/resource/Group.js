'use strict';

var DirectoryChildResource = require('./DirectoryChildResource');
var utils = require('../utils');

/**
 * @class Group
 *
 * @description
 * Encapsulates a Group resource. For full documentation of this resource, please see
 * [REST API Reference: Group](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#group).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Client#getGroup Client.getGroup()}
 * - {@link GroupMembership#getGroup GroupMembership.getGroup()}
 *
 * @augments {InstanceResource}
 *
 * @augments {DirectoryChildResource}
 *
 * @param {Object} groupResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function Group() {
  Group.super_.apply(this, arguments);
}

utils.inherits(Group, DirectoryChildResource);

/**
 * Add an account to this group. This will create a {@link GroupMembership} for
 * the account.
 *
 * @param {Account|Object} account An existing instance of {@link Account}, or
 * an object literal with an `href` property that identifies the account to add.
 *
 * @param {Function} callback - Callback function, will be called with (err,
 * {@link GroupMembership}).
 */
Group.prototype.addAccount = function addGroupAccount(/* accountOrAccountHref, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);

  if (typeof args.account === 'string') {
    args.account = {
      href: args.account
    };
  }

  return this._createGroupMembership(args.account, this, args.options, args.callback);
};

/**
 * Get the account's collection, which is a list of all the accounts in this
 * Group.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `createdAt`, `email`, `givenName`, `middleName`, `modifiedAt`, `surname`,
 * `status`, `username`.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Account} objects.
 *
 * @example
 * var query = {
 *   email: 'foo@example.com'
 * };
 *
 * group.getAccounts(query, function (err, collection) {
 *   collection.each(function (account, next) {
 *     console.log('Found account for ' + account.givenName + ' (' + account.email + ')');
 *     next();
 *   });
 * });
 */
Group.prototype.getAccounts = function getGroupAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

/**
 * Retrieves the list of {@link GroupMembership GroupMemberships} for this group.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link GroupMembership} objects.
 *
 * @example
 * group.getAccountMemberships({ expand: 'account' }, function (err, memberships) {
 *   memberships.each(function (membership, next) {
 *     console.log(membership.account.fullName + ' is in this group');
 *     next();
 *   });
 * });
 */
Group.prototype.getAccountMemberships = function getGroupAccountMemberships(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountMemberships.href, args.options, require('./GroupMembership'), args.callback);
};

module.exports = Group;
