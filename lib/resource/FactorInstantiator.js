'use strict';

var utils = require('../utils');
var SmsFactor = require('./SmsFactor');
var GoogleAuthenticatorFactor = require('./GoogleAuthenticatorFactor');
var InstanceResource = require('./InstanceResource');

function getFactorConstructor() {
  var data = arguments[0];

  if (!data || (typeof data.type === 'undefined')) {
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
  var Ctor = getFactorConstructor.apply(this, arguments);
  var argsWithContext = Array.prototype.slice.call(arguments);

  // Adds an initial parameter. It will be the function context (this)
  // for the bind call. It does not matter because `new` overwrites, it,
  // however, so we're just setting it to null here for syntactic reasons.
  argsWithContext.unshift(null);

  return new (Ctor.bind.apply(Ctor, argsWithContext))();
}

utils.inherits(FactorInstantiator, InstanceResource);

module.exports = {
  Constructor: FactorInstantiator,
  getConstructor: getFactorConstructor
};
