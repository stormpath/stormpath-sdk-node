'use strict';

var _ = require('underscore');
var DirectoryChildResource = require('./DirectoryChildResource');
var utils = require('../utils');

/**
 * @class Account
 *
 * @description
 *
 * Stormpath Account Object. This object encapsulates the raw
 * account data, and provides methods for working with the account resource and
 * its related resources.
 *
 * For a high-level overview of Account resources in Stormpath, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/004_accnt_mgmt.html Account Management}.
 *
 * For a description of the REST API for account objects, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#account REST API Reference: Account}.
 *
 * @augments {DirectoryChildResource}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} accountData
 * The raw JSON data from the account resource, as retrieved from the Stormpath
 * REST API.
 */
function Account(data) {
  Account.super_.apply(this, arguments);

  Object.defineProperty(this, '_isNew', { value: !!data._isNew, configurable: true });
}
utils.inherits(Account, DirectoryChildResource);

/**
 * Retrieves the collection of access tokens that have been issued to this
 * account.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link AccessToken} objects.
 */
Account.prototype.getAccessTokens = function getAccessTokens(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accessTokens.href, args.options, require('./AccessToken'), args.callback);
};

/**
 * Retrieves the collection of refresh tokens that have been issued to this
 * account.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link RefreshToken} objects.
 */
Account.prototype.getRefreshTokens = function getRefreshTokens(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.refreshTokens.href, args.options, require('./RefreshToken'), args.callback);
};

/**
 * Retrieves the collection of groups that this account is a member of.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `name`, `description`, `status`, `createdAt`, `modifiedAt`.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Group} objects.
 */
Account.prototype.getGroups = function getAccountGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

/**
 * Retrieves the collection of group memberships for this account. Group
 * memberships are a resource that represent the link between an account and
 * group.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link GroupMembership} objects.
 */
Account.prototype.getGroupMemberships = function getGroupMemberships(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groupMemberships.href, args.options, require('./GroupMembership'), args.callback);
};

/**
 * Adds the account to the given group.
 *
 * @param {Object|String} group
 * If this parameter is a string, it should be the HREF of the group that the
 * account will be added to.
 *
 * If it is an object, it should have an href property which is the group href.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link GroupMembership}).
 *
 * @example
 *
 * var groupHref = 'https://api.stormpath.com/v1/groups/xxx';
 * account.addToGroup(groupHref, callbackFn);
 *
 * @example
 *
 * var group = {
 *   href: 'https://api.stormpath.com/v1/groups/xxx';
 * };
 *
 * account.addToGroup(group, callbackFn);
 *
 * @example
 *
 * var groupHref = 'https://api.stormpath.com/v1/groups/xxx';
 * client.getGroup(groupHref, function(err, group) {
 *   account.addToGroup(group, callbackFn);
 * });
 */
Account.prototype.addToGroup = function addAccountToGroup(/* groupOrGroupHref, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback'], true);

  if (typeof args.group === 'string') {
    args.group = {
      href: args.group
    };
  }

  return this._createGroupMembership(this, args.group, args.options, args.callback);
};

/**
 * Get the account's provider data resource. The provider data resource
 * contains information about this account's link to a third-party provider,
 * such as Google.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link ProviderData}).
 */
Account.prototype.getProviderData = function getProviderData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.providerData){
    return args.callback();
  }

  return this.dataStore.getResource(this.providerData.href, args.options, require('./ProviderData'), args.callback);
};

/**
 * Creates an {@link ApiKey} for this account, which can be used to
 * authenticate a request to your service. For more information please read
 * {@link http://docs.stormpath.com/guides/api-key-management/ Using Stormpath for API Authentication}.
 *
 * @param  {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link ApiKey}).
 */
Account.prototype.createApiKey = function createApiKey(options, callback) {
  var cb = typeof options === 'function' ? options : callback;
  var opts = _.extend({},this.dataStore.apiKeyEncryptionOptions,typeof options === 'object' ? options : {});

  return this.dataStore.createResource(this.apiKeys.href, opts, null, require('./ApiKey'), cb);
};

/**
 * Retrieves a collection of the account's API Keys.
 *
 * The `secret` property of each resource is encrypted with the tenant API Key
 * Secret that was used to configure the current {@link Client} instance. We do
 * this to ensure that the secret is encrypted at rest, as it may be cached in
 * your caching database.
 *
 * Password-based AES 256 encryption is used. The PBKDF2 implementation will use
 * 1024 iterations by default to derive the AES 256 key.
 *
 * At the risk of potentially decreased security, you can use the
 * `encryptionKeySize` option to specify a smaller encryption key size. You can
 * also request a lower number of key iterations with the `encryptionKeyIterations`
 * option. This can reduce the CPU time required to decrypt the key after transit
 * or when retrieving from cache. It is not recommended to go much lower than
 * 1024 (if at all) in security sensitive environments.
 *
 * @param {CollectionQueryOptions} options
 * Options for querying, paginating, and expanding the collection. This collection does not
 * support filter searches. The following options can also be used with this
 * request:
 *
 * @param {String} [options.id=null]
 * Search for a specific key by key id.
 *
 * @param {Number} [options.encryptionKeySize=256]
 * Set to 128 or 192 to change the AES key encryption size.
 *
 * @param {Number} [options.encryptionKeyIterations=1024]
 * Number of encryption iterations.
 */
Account.prototype.getApiKeys = function getApiKeys(options,callback) {
  var cb = typeof options === 'function' ? options : callback;
  var opts = _.extend({},this.dataStore.apiKeyEncryptionOptions,typeof options === 'object' ? options : {});

  return this.dataStore.getResource(this.apiKeys.href, opts, require('./ApiKey'), cb);
};
/**
 * Save changes to this account.
 *
 * @param  {Function} callback
 * The function to call when the save operation is complete. Will be called
 * with the parameters (err,updatedAccount).
 */
Account.prototype.save = function saveAccount(){
  var self = this;

  var args = Array.prototype.slice.call(arguments);

  // If customData, then inject our own callback and invalidate the
  // customData resource cache when the account finishes saving.
  if (self.customData) {
    var lastArg = args.length > 0 ? args[args.length - 1] : null;
    var originalCallback = typeof lastArg === 'function' ? args.pop() : function nop() {};

    args.push(function newCallback(err) {
      var newCallbackArgs = arguments;

      if (err) {
        return originalCallback(err);
      }

      self.dataStore._evict(self.customData.href, function (err) {
        if (err) {
          return originalCallback(err);
        }

        originalCallback.apply(null, newCallbackArgs);
      });
    });
  }

  Account.super_.prototype.save.apply(self, args);
};

module.exports = Account;
