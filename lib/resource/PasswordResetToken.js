'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class PasswordResetToken
 *
 * @description
 *
 * Encapsulates a PasswordResetToken resource. For full documentation of this
 * resource, please see
 * [REST API Reference: Password Reset Tokens](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#password-reset-tokens).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#sendPasswordResetEmail Application.sendPasswordResetEmail()}.
 *
 * To revoke a password reset token, call `delete()` on an instance of this class.
 *
 * @param {Object} passwordResetTokenResource
 *
 * The JSON representation of this resource.
 *
 */
function PasswordResetToken() {
  PasswordResetToken.super_.apply(this, arguments);
}
utils.inherits(PasswordResetToken, InstanceResource);

module.exports = PasswordResetToken;

/**
 * @method PasswordResetToken.delete
 *
 * @description
 *
 * Deletes this resource from the API.
 *
 * @param {Function} callback
 * The function to call when the delete operation is complete. Will be called
 * with the parameter (err).
 */
