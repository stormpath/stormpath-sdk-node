'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class SamlServiceProvider
 *
 *
 * @param {Object} samlServiceProviderData
 * The raw JSON data of this resource, as retrieved from the Stormpath REST API.
 *
 * @property {String} createdAt
 * The time this resource was created, ISO 8601 format.
 *
 * @property {String} href
 * The HREF of this REST resouce.

 * @property {String} modifiedAt
 * The last time this resource was modified, ISO 8601 format.
 *
 * @property {String} ssoInitiationEndpoint
 * The URL for initiating the redirect to the SAML IdP.  Please refer to
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#the-stormpath-saml-flow The Stormpath SAML Flow}.
 *
 * @description
 *
 * Encapsualtes the SAML Service Provider of an {@link Application}. For more
 * information about SAML Authentication, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#authenticating-against-a-saml-directory Authenticating Against a SAML Directory}.
 *
 * This object does not need to be manually constructed.  It should be obtained
 * from {@link SamlPolicy#getServiceProvider SamlPolicy.getServiceProvider()}
 *
 */
function SamlServiceProvider() {
  SamlServiceProvider.super_.apply(this, arguments);
}

utils.inherits(SamlServiceProvider, InstanceResource);

module.exports = SamlServiceProvider;
