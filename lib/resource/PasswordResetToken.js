'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * Encapsulates a Password Reset Token Resource
 * @class
 *
 * @param {Object} passwordResetTokenResource
 * The JSON response from the Stormpath API, when making a POST request against
 * an application's `/passwordResetTokens` endpoint.
 *
 * @property {Object} account
 * @property {Object} account.href
 * The HREF of the {@link Account} that is associated with this token.
 *
 * @property {String} email The email address that this token was sent to
 *
 * @property {String} href The HREF of the token resource
 */
function PasswordResetToken() {
  PasswordResetToken.super_.apply(this, arguments);
}
utils.inherits(PasswordResetToken, InstanceResource);

module.exports = PasswordResetToken;
