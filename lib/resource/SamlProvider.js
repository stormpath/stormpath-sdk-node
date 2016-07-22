'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class SamlProvider
 *
 * @description
 *
 * Encapsulates a SamlProvider resource, which is a type of {@link Provider}.
 * For full documentation of the Provider resource, please see
 * [REST API Reference: Provider](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#provider).
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
 * - {@link Directory#getProvider Directory.getProvider()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} samlProviderResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
function SamlProvider() {
  SamlProvider.super_.apply(this, arguments);
}

utils.inherits(SamlProvider, InstanceResource);

SamlProvider.prototype.getAttributeStatementMappingRules = function getAttributeStatementMappingRules(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.attributeStatementMappingRules.href, args.options, require('./SamlAttributeStatementMappingRules'), args.callback);
};

/**
 * Get the {@link SamlServiceProviderMetadata} resource of this SamlProvider resouce.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link SamlServiceProviderMetadata samlServiceProviderMetadata}).
 */
SamlProvider.prototype.getServiceProviderMetadata = function getServiceProviderMetadata(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.serviceProviderMetadata.href, args.options, require('./SamlServiceProviderMetadata'), args.callback);
};

module.exports = SamlProvider;
