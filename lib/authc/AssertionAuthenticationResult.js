'use strict';

var Account = require('../resource/Account');

/**
 * Encapsulates the authentication result from an instance of {@link StormpathAssertionAuthenticator}.
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 *
 * - {@link StormpathAssertionAuthenticator#authenticate StormpathAssertionAuthenticator.authenticate()}.
 *
 * @class
 */
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

/**
 * @function
 *
 * @description Get the account resource of the account that has authenticated.
 *
 * @param  {Function} callback
 *
 * The callback to call with the parameters (err, {@link Account}).
 */
AssertionAuthenticationResult.prototype.getAccount = function getAccount(callback) {
  if (!this.account || !this.account.href) {
    return callback(new Error('Unable to get account. Account HREF not specified.'));
  }

  this.dataStore.getResource(this.account.href, Account, callback);
};

module.exports = AssertionAuthenticationResult;
