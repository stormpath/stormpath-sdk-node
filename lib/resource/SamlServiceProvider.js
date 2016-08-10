'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class SamlServiceProvider
 *
 * @description
 *
 * Encapsulates the SAML Service Provider of an {@link Application}. For full
 * documentation of this resource, please see
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
 * - {@link SamlPolicy#getServiceProvider SamlPolicy.getServiceProvider()}
 *
 * @param {Object} samlServiceProviderResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function SamlServiceProvider() {
  SamlServiceProvider.super_.apply(this, arguments);
}

utils.inherits(SamlServiceProvider, InstanceResource);

module.exports = SamlServiceProvider;
