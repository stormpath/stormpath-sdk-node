/**
 * @class AccountCreationPolicy
 *
 * @description
 * Encapsulates the account creation policy of a {@link Directory}. For full documentation of the this resource, please see
 * [REST API Reference: Account Creation Policy](https://docs.stormpath.com/rest/product-guide/latest/reference.html#account-creation-policy).
 *
 * For a high-level overview account verification workflows, please see:
 * - [How to Verify an Account’s Email](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#how-to-verify-an-account-s-email).
 * - [Customizing Stormpath Emails via REST](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#customizing-stormpath-emails-via-rest).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Directory#getAccountCreationPolicy Directory.getAccountCreationPolicy()}
 *
 * @param {Object} accountCreationPolicyResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */

/**
 * @method AccountCreationPolicy.save
 *
 * @description
 *
 * Save changes to this resource.
 *
 * @param {Function} callback
 * The function to call when the save operation is complete. Will be called
 * with the parameters (err, updatedResource).
 */
