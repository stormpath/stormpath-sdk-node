'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class WebConfig
 *
 * @augments {InstanceResource}
 *
 * @description
 *
 * Encapsulates a WebConfig resource, which determines the behaviour of the
 * web application used for the Client API. For full documentation of this
 * resource, please see
 * [Configuring the Client API](https://docs.stormpath.com/client-api/product-guide/latest/configuration.html).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#getWebConfig Application.getWebConfig()}.
 *
 * @param {Object} webConfigResource
 *
 * The JSON representation of this resource.
 */
function WebConfig() {
  WebConfig.super_.apply(this, arguments);
}

utils.inherits(WebConfig, InstanceResource);

/**
 * Retrieves the {@link Application} that this web configuration is attached to.
 *
 * @param {ExpansionOptions} options
 * Options for retrieving the linked resources of the application.
 *
 * @param {Function} callback
 * The function to call after the query has completed. It will be called with
 * (err, {@link Application}).
 */
WebConfig.prototype.getApplication = function getWebConfigApplication(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.application.href, args.options, require('./Application'), args.callback);
};

/**
 * Retrieves the {@link ApiKey} that this web config is using for signing tokens.
 *
 * @param {Options} options
 * Options for retrieving the linked resources of the API Key.
 *
 * @param {Function} callback
 * The function to call after the query has completed. It will be called with
 * (err, {@link ApiKey}).
 */
WebConfig.prototype.getSigningApiKey = function getSigningApiKey(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.signingApiKey.href, args.options, require('./ApiKey'), args.callback);
};

/**
 * Retrieves the {@link Tenant} for this web configuration.
 *
 * @param {ExpansionOptions} options
 * Options for retrieving the linked resources of the tenant.
 *
 * @param {Function} callback
 * The function to call after the query has completed. It will be called with
 * (err, {@link Tenant}).
 */
WebConfig.prototype.getTenant = function getWebConfigTenant(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

module.exports = WebConfig;