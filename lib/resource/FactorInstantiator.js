'use strict';

var utils = require('../utils');
var Factor = require('./Factor');
var SmsFactor = require('./SmsFactor');
var GoogleAuthenticatorFactor = require('./GoogleAuthenticatorFactor');
var InstanceResource = require('./InstanceResource');

/**
* Retrieves the constructor for a correct {@link Factor} instance ({@link SmsFactor} or
* {@link GoogleAuthenticatorFactor}) for corresponding JSON data for the factor.
*
* @private
*
* @param {FactorData} factor
* The data for the factor object
*
* @throws Error If the type is not defined or if it is not a valid type (SMS or google-authenticator)
*/
function getFactorConstructor(/* factor */) {
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
    return Factor;
  }
}

/**
* @private
*
* @class FactorInstantiator
*
* @description
* The constructor for {@link Factor} instances ({@link SmsFactor} or
* {@link GoogleAuthenticatorFactor}). It parses the data to construct the
* correct constructor, and calls it with the data. It is used for polymorphic
* factor instantiation. It augments {@link InstanceResource} to adhere to the
* interface used for instantiation in {@link ResourceFactory}.
*
* @augments InstanceResource
*/
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
