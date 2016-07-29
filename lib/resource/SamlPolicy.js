'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class SamlPolicy
 *
 * @description
 *
 * Encapsulates the SAML Policy of an {@link Application}. For full documentation
 * of the this resource, please see
 * [REST API Reference: SAML Policy Resource](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#saml-policy-resource).
 *
 * For a high-level overview of SAML Authentication, please see
 * [Authenticating Against a SAML Directory](https://docs.stormpath.com/rest/product-guide/latest/auth_n.html?#authenticating-against-a-saml-directory).
 *
 * For more information about configuring SAML Authentication, please see
 * [Configuring SAML via REST](https://docs.stormpath.com/rest/product-guide/latest/auth_n.html?#configuring-saml-via-rest).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#getSamlPolicy Application.getSamlPolicy()}
 *
 * @param {Object} samlPolicyResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
function SamlPolicy() {
  SamlPolicy.super_.apply(this, arguments);
}

utils.inherits(SamlPolicy, InstanceResource);

/**
 * Get the {@link SamlServiceProvider} resource of this SAML Policy resource.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link SamlServiceProvider} resource during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link SamlServiceProvider samlServiceProvider}).
 */
SamlPolicy.prototype.getServiceProvider = function getServiceProvider(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.serviceProvider.href, args.options, require('./SamlServiceProvider'), args.callback);
};

module.exports = SamlPolicy;
