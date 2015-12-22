'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function PasswordPolicy() {
  PasswordPolicy.super_.apply(this, arguments);
}

utils.inherits(PasswordPolicy, InstanceResource);

PasswordPolicy.prototype.getStrength = function() {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.strength.href, args.options, require('./Strength'), args.callback);
};

module.exports = PasswordPolicy;
