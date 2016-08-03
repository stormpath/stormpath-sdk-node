'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class PasswordPolicy
 *
 * @description
 * Encapsulates a PasswordPolicy resource of a {@link Directory}. For full documentation of this resource, please see
 * [REST API Reference: Password Policy](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#password-policy).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Directory#getPasswordPolicy Directory.getPasswordPolicy()}.
 *
 * @augments {InstanceResource}
 *
 * @param {Object} passwordPolicyResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function PasswordPolicy() {
  PasswordPolicy.super_.apply(this, arguments);
}

utils.inherits(PasswordPolicy, InstanceResource);

/**
 * Get the {@link Strength} resource of this PasswordPolicy resource.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Strength} resource during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Strength}).
 */
PasswordPolicy.prototype.getStrength = function() {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.strength.href, args.options, require('./Strength'), args.callback);
};

module.exports = PasswordPolicy;
