'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Factor
 *
 * @description
 *
 * Encapsulates a Factor resource, used for purposes of Multi-Factor Authentication.
 * For full documentation of this resource,
 * please see
 * [REST API Reference: Factor](https://docs.stormpath.com/rest/product-guide/latest/reference.html#ref-factor).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#createFactor Account.createFactor()}
 * - {@link Account#getFactors Account.getFactors()}
 * - {@link Challenge#getFactor Challenge.getFactor()}
 *
 * Additionally, raw instances of Factor should never be used. Instead, it is augmented
 * by concrete {@link SmsFactor} and {@link GoogleAuthenticatorFactor} resources, which
 * should be used instead, and will be passed to all callbacks.
 *
 * @augments {InstanceResource}
 *
 * @private
 *
 * @param {Object} factorResource
 *
 * The JSON representation of this resource.
 */
function Factor() {
  Factor.super_.apply(this, arguments);
}

utils.inherits(Factor, InstanceResource);

/**
* Retrieves the {@link Account} this factor belongs to.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with
* (err, {@link Account}).
*/
Factor.prototype.getAccount = function getFactorAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

/**
* Create a {@link Challenge} for this factor, which is used to start the multi-factor
* authentication procedure.
*
* @param {FactorData} challenge
* The data for the challenge object.
*
* @param {String} [challenge.message]
* The message to be sent to the user. See
* {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#challenging-a-factor Challenging a factor}.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with the
* parameters (err, {@link Challenge}).
*
* @example
* var challengeData = {
*   message: '${code}'
* };
*
* factor.createChallenge(factorData, function(err, createdChallenge) {
*   console.log(createdChallenge);
* });
*/

Factor.prototype.createChallenge = function createFactorChallenge(/* challenge, [options], callback */) {
  var args = utils.resolveArgs(arguments, ['challenge', 'options', 'callback']);
  return this.dataStore.createResource(this.challenges.href, args.options, args.challenge, require('./Challenge'), args.callback);
};

/**
* Retrieves a list of challenges for this factor.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called
* with the parameters (err, {@link CollectionResource}). The collection will
* be a list of {@link Challenge} objects.
*
*/
Factor.prototype.getChallenges = function getFactorChallenges(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback']);
  return this.dataStore.getResource(this.challenges.href, args.options, require('./Challenge'), args.callback);
};

/**
* Retrieves the most recent challenge for this factor, or null if none is defined.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with the
* parameters (err, {@link Challenge}), or (err, null) if there is no most recent
* challenge available.
*/
Factor.prototype.getMostRecentChallenge = function getMostRecentChallenge(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback']);

  if (!this.mostRecentChallenge || !this.mostRecentChallenge.href) {
    args.callback(null, null);
  }

  return this.dataStore.getResource(this.mostRecentChallenge.href, args.options, require('./Challenge'), args.callback);
};

module.exports = Factor;
