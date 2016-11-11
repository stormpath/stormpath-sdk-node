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
 * - {@link Client#getFactor Client.getFactor()}
 *
 * Additionally, raw instances of Factor should never be used. Instead, it is extended
 * by concrete {@link SmsFactor} or {@link GoogleAuthenticatorFactor} resources, which
 * should be used instead, and will be passed to all callbacks.
 *
 * @augments {InstanceResource}
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
Factor.prototype.getAccount = function getFactorAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

/**
* Retrieves a list of challenges for this factor.
*
* @param {CollectionQueryOptions} options
* Options for querying, filtering, sorting, paginating and expanding the query. It can be expanded
* on `account` and `factor` fields.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called
* with the parameters (err, {@link CollectionResource}). The collection will
* be a list of {@link Challenge} objects.
*
*/
Factor.prototype.getChallenges = function getFactorChallenges(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.challenges.href, args.options, require('./Challenge'), args.callback);
};

/**
 * Retrieves the most recent challenge for this factor, or null if none is defined.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Challenge} during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link Challenge}), or (err, null) if there is no most recent
 * challenge available.
*/
Factor.prototype.getMostRecentChallenge = function getMostRecentChallenge(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.mostRecentChallenge || !this.mostRecentChallenge.href) {
    return process.nextTick(args.callback.bind(null, null, null));
  }

  return this.dataStore.getResource(this.mostRecentChallenge.href, args.options, require('./Challenge'), args.callback);
};

module.exports = Factor;
