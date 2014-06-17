'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function AuthenticationResult() {
  AuthenticationResult.super_.apply(this, arguments);
}
utils.inherits(AuthenticationResult, InstanceResource);

AuthenticationResult.prototype.getAccount = function getAuthenticationResultAccount(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.account.href, options, require('./Account'), callback);
};

module.exports = AuthenticationResult;
