'use strict';

var InstanceResource = require('./InstanceResource');
var FactorCtor = require('./FactorInstantiator').Constructor;
var utils = require('../utils');

/**
 * @class Challenge
 *
 * @description
 *
 * Encapsulates a Challenge resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Challenge](https://docs.stormpath.com/rest/product-guide/latest/reference.html#challenge).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Factor#createChallenge Factor.createChallenge()}
 *
 * @augments {Resource}
 *
 * @param {Object} challengeResource
 *
 * The JSON representation of this resource.
 */
function Challenge() {
  Challenge.super_.apply(this, arguments);
}

utils.inherits(Challenge, InstanceResource);

/**
* Retrieves the {@link Factor} instance ({@link SmsFactor} or {@link GoogleAuthenticatorFactor})
* that this challenge is linked to.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with the
* parameters (err, {@link SmsFactor}) or (err, {@link GoogleAuthenticatorFactor}),
* depending on the type of the returned resource.
*/
Challenge.prototype.getFactor = function getFactor(/* [options], cb */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.factor.href, args.options, FactorCtor, args.callback);
};

/**
* Retrieves the {@link Account} this challenge belongs to.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with
* (err, {@link Account}).
*/

Challenge.prototype.getAccount = function getAccount(/* [options], cb */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

module.exports = Challenge;
