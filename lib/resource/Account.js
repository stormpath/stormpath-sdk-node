'use strict';

var _ = require('underscore');
var DirectoryChildResource = require('./DirectoryChildResource');
var utils = require('../utils');

function Account(data) {
  Account.super_.apply(this, arguments);

  Object.defineProperty(this, '_isNew', { value: !!data._isNew, configurable: true });
}
utils.inherits(Account, DirectoryChildResource);

Account.prototype.getAccessTokens = function getAccessTokens(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accessTokens.href, args.options, require('./AccessToken'), args.callback);
};

Account.prototype.getRefreshTokens = function getRefreshTokens(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.refreshTokens.href, args.options, require('./RefreshToken'), args.callback);
};

Account.prototype.getGroups = function getAccountGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

Account.prototype.getGroupMemberships = function getGroupMemberships(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groupMemberships.href, args.options, require('./GroupMembership'), args.callback);
};

Account.prototype.addToGroup = function addAccountToGroup(/* groupOrGroupHref, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback'], true);

  if (typeof args.group === 'string') {
    args.group = {
      href: args.group
    };
  }

  return this._createGroupMembership(this, args.group, args.options, args.callback);
};

Account.prototype.getProviderData = function getProviderData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.providerData){
    return args.callback();
  }

  return this.dataStore.getResource(this.providerData.href, args.options, require('./ProviderData'), args.callback);
};

Account.prototype.createApiKey = function createApiKey(options, callback) {
  var cb = typeof options === 'function' ? options : callback;
  var opts = _.extend({},this.dataStore.apiKeyEncryptionOptions,typeof options === 'object' ? options : {});

  return this.dataStore.createResource(this.apiKeys.href, opts, null, require('./ApiKey'), cb);
};

Account.prototype.getApiKeys = function getApiKeys(options,callback) {
  var cb = typeof options === 'function' ? options : callback;
  var opts = _.extend({},this.dataStore.apiKeyEncryptionOptions,typeof options === 'object' ? options : {});

  return this.dataStore.getResource(this.apiKeys.href, opts, require('./ApiKey'), cb);
};

Account.prototype.save = function saveAccount(){
  var self = this;

  var args = Array.prototype.slice.call(arguments);

  // If customData, then inject our own callback and invalidate the
  // customData resource cache when the account finishes saving.
  if (self.customData) {
    var lastArg = args.length > 0 ? args[args.length - 1] : null;
    var originalCallback = typeof lastArg === 'function' ? args.pop() : function nop() {};

    args.push(function newCallback() {
      self.dataStore._evict(self.customData.href, originalCallback);
    });
  }

  self._applyCustomDataUpdatesIfNecessary(function(){
    Account.super_.prototype.save.apply(self, args);
  });
};

module.exports = Account;
