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
 *
 * @augments {InstanceResource}
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
* Retrieves the phone to which the multi-factor authentication SMS is sent to.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with the
* parameters (err, {@link Phone}).
*/
SmsFactor.prototype.getPhone = function getPhone(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.phone.href, args.options, require('./Phone'), args.callback);
};

module.exports = SmsFactor;
