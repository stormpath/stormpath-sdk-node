'use strict';

var Factor = require('./Factor');
var utils = require('../utils');

/**
 * @class GoogleAuthenticatorFactor
 *
 * @description
 *
 * Encapsulates a Factor resource, used for purposes of Multi-Factor Authentication.
 * This type of Factor uses Google Authenticator as a two-factor authentication method.
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
function GoogleAuthenticatorFactor() {
  GoogleAuthenticatorFactor.super_.apply(this, arguments);
}

utils.inherits(GoogleAuthenticatorFactor, Factor);

module.exports = GoogleAuthenticatorFactor;
