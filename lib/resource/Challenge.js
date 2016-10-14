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
 * @augments {InstanceResource}
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
 * Retrieves the factor instance ({@link SmsFactor} or {@link GoogleAuthenticatorFactor})
 * that this challenge is linked to.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the factor during this request.
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

/**
 * This method verifies the challenge by posting the challenge code to the challenge
 * resource. If the posted code is correct, the callback will return the same
 * challenge resource, but the `STATUS` property will now be `SUCCESS`.
 *
 * @param {String} code
 *
 * The code to post to the challenge. If the challenge is for a `google-authenticator`
 * factor, the code is from the user's Google Authenticator application. If the challenge is for an `SMS` factor, the code is the one that
 * was sent to the user's phone number.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with
 * (err, {@link Challenge}).
 *
 * @example
 * challenge.verifyCode('815331', function(err, challenge){
 *   if (err) {
 *     // Code is incorrect or has expired
 *     return console.log(err);
 *   }
 *
 *   console.log(challenge.status); // SUCCESS
 * });
*/

Challenge.prototype.verifyCode = function verifyCode(/* code, cb */) {
  var args = utils.resolveArgs(arguments, ['code', 'callback']);
  return this.dataStore.createResource(this.href, { code: args.code }, Challenge, args.callback);
};

module.exports = Challenge;
