'use strict';

var Factor = require('./Factor');
var utils = require('../utils');

/**
 * @class SmsFactor
 *
 * @description
 *
 * Encapsulates a Factor resource, used for purposes of Multi-Factor Authentication.
 * This type of Factor uses SMS as a multi-factor authentication method.
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
function SmsFactor() {
  SmsFactor.super_.apply(this, arguments);
}

utils.inherits(SmsFactor, Factor);


/**
 * Create a {@link Challenge} for this factor, which is used to start the multi-factor
 * authentication procedure.  This will send an SMS message to the user with the
 * code.  For more information about this process, See
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#challenging-an-sms-factor Challenging an SMS Factor}.
 *
 * @param {Object} [challenge]
 * An object literal for configuring the challenge.  If this object is not provied,
 * a default challenge message will be sent.
 *
 * @param {String} challenge.message
 * The message to be sent to the user.
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
 * var challenge = {
 *   message: 'Your verification code is: ${code}'
 * };
 *
 * smsFactor.createChallenge(challenge, function(err, createdChallenge) {
 *   if (err) {
 *     return console.log(err);
 *   }
 *   console.log(createdChallenge);
 * });
*/
SmsFactor.prototype.createChallenge = function createFactorChallenge(/* challenge, [options], callback */) {
  var args = utils.resolveArgs(arguments, ['challenge', 'options', 'callback'], true);
  return this.dataStore.createResource(this.challenges.href, args.options, args.challenge, require('./Challenge'), args.callback);
};


/**
 * Retrieves the phone to which the multi-factor authentication SMS is sent to.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Phone} during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link Phone}).
*/
SmsFactor.prototype.getPhone = function getPhone(/* callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.phone.href, args.options, require('./Phone'), args.callback);
};

module.exports = SmsFactor;
