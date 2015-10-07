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
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accessTokens.href, options, require('./AccessToken'), callback);
};

Account.prototype.getRefreshTokens = function getRefreshTokens(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.refreshTokens.href, options, require('./RefreshToken'), callback);
};

Account.prototype.getGroups = function getAccountGroups(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.groups.href, options, require('./Group'), callback);
};

Account.prototype.getGroupMemberships = function getGroupMemberships(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.groupMemberships.href, options, require('./GroupMembership'), callback);
};

Account.prototype.addToGroup = function addAccountToGroup(/* groupOrGroupHref, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var group = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (typeof group === 'string') {
    group = {
      href: group
    };
  }

  return self._createGroupMembership(self, group, options, callback);
};

Account.prototype.getProviderData = function getProviderData(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!self.providerData){
    return callback();
  }

  return self.dataStore.getResource(self.providerData.href, options, require('./ProviderData'), callback);
};

Account.prototype.createApiKey = function createApiKey(options,callback) {
  var self = this;
  var cb = typeof options === 'function' ? options : callback;
  var opts = _.extend({},self.dataStore.apiKeyEncryptionOptions,typeof options === 'object' ? options : {});

  return self.dataStore.createResource(self.apiKeys.href, opts, null, require('./ApiKey'), cb);
};

Account.prototype.getApiKeys = function getApiKeys(options,callback) {
  var self = this;
  var cb = typeof options === 'function' ? options : callback;
  var opts = _.extend({},self.dataStore.apiKeyEncryptionOptions,typeof options === 'object' ? options : {});

  return self.dataStore.getResource(self.apiKeys.href, opts, require('./ApiKey'), cb);
};

Account.prototype.save = function saveAccount(){
  var self = this;
  var args = arguments;
  self._applyCustomDataUpdatesIfNecessary(function(){
    Account.super_.prototype.save.apply(self, args);
  });
};

module.exports = Account;
