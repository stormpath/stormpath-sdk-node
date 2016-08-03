'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Strength
 *
 * @description
 * Encapsulates a Password Strength resource of a {@link PasswordPolicy}. For full documentation of the this resource, please see
 * [REST API Reference: Password Strength](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#password-strength).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link PasswordPolicy#getStrength PasswordPolicy.getStrength()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} passwordStrengthResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function Strength() {
  Strength.super_.apply(this, arguments);
}

utils.inherits(Strength, InstanceResource);

module.exports = Strength;
