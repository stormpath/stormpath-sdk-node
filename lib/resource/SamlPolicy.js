'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class SamlPolicy
 *
 * @description
 *
 * Encapsulates the SAML Policy of an {@link Application}. For more information
 * about SAML Authentication, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#authenticating-against-a-saml-directory Authenticating Against a SAML Directory}.
 *
 * This object does not need to be manually constructed. It should be obtained
 * from {@link Application#getSamlPolicy Application.getSamlPolicy()}.
 *
 * @param {Object} samlPolicyData
 * The raw JSON data of this resource, as retrieved from the Stormpath REST API.
 *
 * @property {String} createdAt
 * The time this resource was created, ISO 8601 format.
 *
 * @property {String} href
 * The HREF of this REST resource.
 *
 * @property {String} modifiedAt
 * The last time this resource was modified, ISO 8601 format.
 *
 * @property {String} serviceProvider.href
 * The HREF of the linked {@link SamlServiceProvider} resource.
 */
function SamlPolicy() {
  SamlPolicy.super_.apply(this, arguments);
}

utils.inherits(SamlPolicy, InstanceResource);

/**
 * Get the {@link SamlServiceProvider} resource of this SAML Policy resouce.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link SamlServiceProvider samlServiceProvider}).
 */
SamlPolicy.prototype.getServiceProvider = function getServiceProvider(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.serviceProvider.href, args.options, require('./SamlServiceProvider'), args.callback);
};

module.exports = SamlPolicy;
