'use strict';

var utils = require('../utils');
var SmsFactor = require('./SmsFactor');
var GoogleAuthenticatorFactor = require('./GoogleAuthenticatorFactor');
var InstanceResource = require('./InstanceResource');

function getFactorConstructor() {
  var data = arguments[0];

  if (!data || (typeof data.type === 'undefined')) {
    console.log('??????', data);
    throw new Error('Factor instances must have a defined type');
  }

  var type = data.type.toLowerCase();

  switch (type) {
  case 'sms':
    return SmsFactor;
  case 'google-authenticator':
    return GoogleAuthenticatorFactor;
  default:
    throw new Error('Unknown factor type `' + type + '`');
  }
}

function FactorInstantiator() {
  return getFactorConstructor.apply(this, arguments).apply(this, arguments);
}

utils.inherits(FactorInstantiator, InstanceResource);

module.exports = {
  Constructor: FactorInstantiator,
  getConstructor: getFactorConstructor
};
