'use strict';

var nJwt = require('njwt');
var Account = require('../resource/Account');

function AssertionAuthenticationResult(dataStore, data) {
  this.dataStore = dataStore;

  // Copy data properties.
  if (data) {
    for (var key in data) {
      if (key in this) {
        continue;
      }
      this[key] = data[key];
    }
  }

  var apiKey = this._getApiKey();
  this.token = nJwt.verify(this.token, apiKey.secret);

  this.account = {
    href: this.token.body.sub
  };
}

AssertionAuthenticationResult.prototype._getApiKey = function _getApiKey() {
  return this.dataStore.requestExecutor.options.client.apiKey;
};

AssertionAuthenticationResult.prototype.getAccount = function getAccount(callback) {
  if (!this.account || !this.account.href) {
    return callback(new Error('Unable to get account. Account HREF not specified.'));
  }

  this.dataStore.getResource(this.account.href, Account, callback);
};

module.exports = AssertionAuthenticationResult;
