'use strict';

var utils = require('../utils');
var Factor = require('./Factor');
var SmsFactor = require('./SmsFactor');
var GoogleAuthenticatorFactor = require('./GoogleAuthenticatorFactor');
var InstanceResource = require('./InstanceResource');

function getFactorConstructor(args) {
  var data = args[0];

  if (!data || !data.type) {
    throw new Error('Factor instances must have a defined type');
  }

  var type = data.type.toLowerCase();

  switch (type) {
  case 'sms':
    return SmsFactor;
  case 'google-authenticator':
    return GoogleAuthenticatorFactor;
  default:
    return Factor; // Default to plain factor (maybe issue warning or error?)
  }
}

function FactorInstantiator() {
  return getFactorConstructor(arguments).apply(this, arguments);
}

utils.inherits(FactorInstantiator, InstanceResource);

module.exports = {
  Constructor: FactorInstantiator,
  getConstructor: getFactorConstructor
};
