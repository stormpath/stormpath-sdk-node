'use strict';
var async = require('async');
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function Application() {
  Application.super_.apply(this, arguments);
}
utils.inherits(Application, InstanceResource);

Application.prototype.authenticateAccount = function authenticateApplicationAccount(authcRequest, callback) {
  var _this = this,
    username = authcRequest.username,
    password = authcRequest.password,
    type = authcRequest.type || 'basic';

  var loginAttempt = {
    type: type,
    value: utils.base64.encode(username + ":" + password)
  };

  _this.dataStore.createResource(_this.loginAttempts.href, {expand: 'account'}, loginAttempt, require('./AuthenticationResult'), callback);
};

Application.prototype.sendPasswordResetEmail = function sendApplicationPasswordResetEmail(emailOrUsername, callback) {
  var self = this;
  return self.dataStore.createResource(self.passwordResetTokens.href, {email: emailOrUsername}, callback);
};

Application.prototype.verifyPasswordResetToken = function verifyApplicationPasswordResetToken(token, callback) {
  var self = this;
  var href = self.passwordResetTokens.href + "/" + token;
  return self.dataStore.getResource(href, callback);
};

Application.prototype.getAccounts = function getApplicationAccounts(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accounts.href, options, require('./Account'), callback);
};

Application.prototype.createAccount = function createApplicationAccount(/* account, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var account = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.createResource(self.accounts.href, options, account, require('./Account'), callback);
};

Application.prototype.getGroups = function getApplicationGroups(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.groups.href, options, require('./Group'), callback);
};

Application.prototype.createGroup = function createApplicationGroup(/* group, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var group = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.createResource(self.groups.href, options, group, require('./Group'), callback);
};

Application.prototype.getTenant = function getApplicationTenant(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.tenant.href, options, require('./Tenant'), callback);
};

// AccountStoreMapping functionality

Application.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accountStoreMappings.href, options, require('./AccountStoreMapping'), callback);
};

Application.prototype.getDefaultAccountStore = function getDefaultAccountStore(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!self.defaultAccountStoreMapping) {
    return callback();
  }

  return self.dataStore.getResource(self.defaultAccountStoreMapping.href, options, require('./AccountStoreMapping'), callback);
};

Application.prototype.setDefaultAccountStore = function setDefaultAccountStore(store, callback) {
  var self = this;
  self.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }
    // todo: switch to detect series
    // res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href)}, onGetASM);

    if (!res.items.length){
      return onGetASM();
    }

    // ugly hack to detect each loop finished
    var q = async.queue(function (asm, cb) {
      if (asm.accountStore.href === store.href) {
        onGetASM(asm);
        onGetASM = function () {
        };
      }
      cb();
    }, 1);
    q.drain = function () {
      onGetASM();
    };

    res.each(function (err, asm) {
      if (err) {
        return callback(err);
      }
      q.push(asm);
    });
    // todo: switch to detect series
  });

  function onGetASM(asm) {
    if (asm) {
      return updateApp(null, asm);
    }

    var mapping = require('./ResourceFactory').instantiate(require('./AccountStoreMapping'), { isDefaultAccountStore: true}, null, self.dataStore);
    mapping.setAccountStore(store);
    mapping.setApplication(self);
    return self.dataStore.createResource('/accountStoreMappings', null, mapping, require('./AccountStoreMapping'), updateApp);
  }

  function updateApp(err, map) {
    if (err) {
      return callback(err);
    }

    self.defaultAccountStoreMapping = { href: map.href };
    self.save(callback);
  }
};

Application.prototype.getDefaultGroupStore = function getDefaultGroupStore(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (!self.defaultGroupStoreMapping) {
    return callback();
  }

  return self.dataStore.getResource(self.defaultGroupStoreMapping.href, options, require('./AccountStoreMapping'), callback);
};

Application.prototype.setDefaultGroupStore = function setDefaultGroupStore(store, callback) {
  var self = this;
  self.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }
    // todo: switch to detect series
    // res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href)}, onGetASM);

    if (!res.items.length){
      return onGetASM();
    }

    // ugly hack to detect each loop finished
    var q = async.queue(function (asm, cb) {
      if (asm.accountStore.href === store.href) {
        onGetASM(asm);
        onGetASM = function () {
        };
      }
      cb();
    }, 1);
    q.drain = function () {
      onGetASM();
    };

    res.each(function (err, asm) {
      if (err) {
        return callback(err);
      }
      q.push(asm);
    });
    // todo: switch to detect series
  });

  function onGetASM(asm) {
    if (asm) {
      return updateApp(null, asm);
    }

    var mapping = require('./ResourceFactory').instantiate(require('./AccountStoreMapping'), { isDefaultGroupStore: true}, null, self.dataStore);
    mapping.setAccountStore(store);
    mapping.setApplication(self);
    return self.dataStore.createResource('/accountStoreMappings', null, mapping, require('./AccountStoreMapping'), updateApp);
  }

  function updateApp(err, map) {
    if (err) {
      return callback(err);
    }

    self.defaultGroupStoreMapping = { href: map.href };
    self.save(callback);
  }
};

Application.prototype.createAccountStoreMapping = function createAccountStoreMapping(accountStoreMapping, callback) {
  var mapping = require('./ResourceFactory').instantiate(require('./AccountStoreMapping'), accountStoreMapping, null, this.dataStore);
  mapping.setApplication(this);
  return this.dataStore.createResource('/accountStoreMappings', null, mapping, require('./AccountStoreMapping'), callback);
};

Application.prototype.addAccountStore = function addAccountStore(store, callback) {
  var mapping = require('./ResourceFactory').instantiate(require('./AccountStoreMapping'), {}, null, this.dataStore);
  mapping.setAccountStore(store);
  mapping.setApplication(this);
  return this.dataStore.createResource('/accountStoreMappings', null, mapping, require('./AccountStoreMapping'), callback);
};

module.exports = Application;
