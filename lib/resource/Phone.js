'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Phone
 *
 * @description
 *
 * Encapsulates a Phone resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Phone](https://docs.stormpath.com/rest/product-guide/latest/reference.html#ref-phone).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#createFactor Account.getFactor()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} phoneResource
 *
 * The JSON representation of this resource.
 */
function Phone() {
  Phone.super_.apply(this, arguments);
}

utils.inherits(Phone, InstanceResource);

/**
* Retrieves the {@link Account} this phone belongs to.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with
* (err, {@link Account}).
*/
Phone.prototype.getAccount = function getPhoneAccount(/* callback */) {
  var args = utils.resolveArgs(arguments, ['callback'], true);
  return this.dataStore.getResource(this.account.href, {}, require('./Account'), args.callback);
};

module.exports = Phone;
