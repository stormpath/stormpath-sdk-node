'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class SamlServiceProviderMetadata
 *
 * @description
 *
 * Encapsulates a SAML Service Provider Metadata Resource. For full
 * documentation of this resource, please see
 * [Retrieve Your Service Provider Metadata](https://docs.stormpath.com/rest/product-guide/latest/auth_n.html?#step-3-retrieve-your-service-provider-metadata).
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
 * - {@link SamlProvider#getServiceProviderMetadata SamlProvider.getServiceProviderMetadata()}
 *
 * @param {Object} samlServiceProviderMetadataResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function SamlServiceProviderMetadata() {
  SamlServiceProviderMetadata.super_.apply(this, arguments);
}

utils.inherits(SamlServiceProviderMetadata, InstanceResource);

module.exports = SamlServiceProviderMetadata;
