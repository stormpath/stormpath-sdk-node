'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function PasswordPolicy() {
  PasswordPolicy.super_.apply(this, arguments);
}

utils.inherits(PasswordPolicy, InstanceResource);

PasswordPolicy.prototype.getStrength = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.strength.href, options, require('./Strength'), callback);
};

module.exports = PasswordPolicy;
