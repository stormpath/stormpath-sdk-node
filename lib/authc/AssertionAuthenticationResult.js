'use strict';

var Account = require('../resource/Account');

function AssertionAuthenticationResult(dataStore, data) {
  Object.defineProperty(this, 'dataStore', {
    enumerable:false,
    value: dataStore
  });

  // Copy data properties.
  if (data) {
    for (var key in data) {
      if (key in this) {
        continue;
      }
      this[key] = data[key];
    }
  }
}

AssertionAuthenticationResult.prototype.getAccount = function getAccount(callback) {
  if (!this.account || !this.account.href) {
    return callback(new Error('Unable to get account. Account HREF not specified.'));
  }

  this.dataStore.getResource(this.account.href, Account, callback);
};

module.exports = AssertionAuthenticationResult;
