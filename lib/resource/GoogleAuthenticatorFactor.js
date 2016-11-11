'use strict';

var Factor = require('./Factor');
var utils = require('../utils');

/**
 * @class GoogleAuthenticatorFactor
 *
 * @description
 *
 * Encapsulates a Factor resource, used for purposes of Multi-Factor Authentication.
 * This type of Factor uses Google Authenticator as a multi-factor authentication method.
 * For full documentation of this resource,
 * please see
 * [REST API Reference: Creating a Factor](https://docs.stormpath.com/rest/product-guide/latest/reference.html#creating-a-factor).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#createFactor Account.createFactor()}
 * - {@link Account#getFactors Account.getFactors()}
 * - {@link Challenge#getFactor Challenge.getFactor()}
 * - {@link Client#getFactor Client.getFactor()}
 *
 * @augments {Factor}
 *
 * @param {Object} factorResource
 *
 * The JSON representation of this resource.
 */
function GoogleAuthenticatorFactor() {
  GoogleAuthenticatorFactor.super_.apply(this, arguments);
}

utils.inherits(GoogleAuthenticatorFactor, Factor);

/**
 * Create a {@link Challenge} resource for this factor.  The new challenge resource
 * will have a status of `CREATED`.  Once the user provides a code from their Google
 * Authenticator application, you will verify it with `challenge.verifyCode()`
 *
 * @param {Object} [requestOptions]
 * Query parameters for this request. These can be any of the {@link ExpansionOptions},
 * e.g. to retrieve linked resources of the new {@link Challenge} during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link Challenge}).
 *
 * @example
 *
 * googleAuthenticatorFactor.createChallenge(function(err, createdChallenge) {
 *   if (err) {
 *     return console.log(err)
 *   }
 *
 *   console.log(createdChallenge);
 * });
 */
GoogleAuthenticatorFactor.prototype.createChallenge = function createFactorChallenge(/* callback */) {
  var args = utils.resolveArgs(arguments, ['options','callback'], true);
  return this.dataStore.createResource(this.challenges.href, args.options, null, require('./Challenge'), args.callback);
};

module.exports = GoogleAuthenticatorFactor;
