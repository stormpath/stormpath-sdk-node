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
 * - {@link Client#getChallenge Client.getChallenge()}
 * - {@link SmsFactor#createChallenge SmsFactor.createChallenge()}
 * - {@link GoogleAuthenticatorFactor#createChallenge GoogleAuthenticatorFactor.createChallenge()}
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
 * For retrieving linked resources of the {@link Factor} for this request.
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
* @param {ExpansionOptions} [expansionOptions]
* For retrieving linked resources of the {@link Account} for this request.
* This resource supports expansions for `customData`, `tenant`, `directory`,
* `groups`, and `groupMemberships`. Groups and group memberships can also be
* expanded and paginated.
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
 * challenge resource, but the `STATUS` property will now be `SUCCESS`.  If the
 * code is incorrect, the status will be `FAILED`.  If the challenge has expired,
 * an error will be returned.
 *
 * @param {String} code
 *
 * The code to post to the challenge. If the challenge is for a `google-authenticator`
 * factor, the code is from the user's Google Authenticator application. If the
 * challenge is for an `SMS` factor, the code is the one that was sent to the
 * user's phone number when the challenge was created
 *
 * @param {Object} [requestOptions]
 * Query parameters for this request. These can be any of the {@link ExpansionOptions},
 * e.g. to retrieve linked resources of the {@link Challenge} during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with
 * (err, {@link Challenge}).
 *
 * @example
 * challenge.verifyCode('815331', function(err, updatedChallenge){
 *   if (err) {
 *     // The challenge has expired or has already been verified
 *     return console.log(err);
 *   }
 *
 *   if (updatedChallenge.status === 'FAILED') {
 *     return console.log('Incorrect code, please try again.');
 *   }
 *
 *   console.log(updatedChallenge.status); // SUCCESS
 * });
*/

Challenge.prototype.verifyCode = function verifyCode(/* code, [options], callback */) {
  var args = utils.resolveArgs(arguments, ['code', 'options', 'callback']);

  return this.dataStore.createResource(this.href, args.options, {code: args.code}, Challenge, args.callback);
};

module.exports = Challenge;
