'use strict';

var utils = require('../utils');
var AccountStoreMapping = require('./AccountStoreMapping');

/**
 * @class
 *
 * @augments {AccountStoreMapping}
 *
 * @description
 *
 * This object encapsulates an Application Account Store Mapping, which
 * represents the link between an {@link Application} and an Account Store, such
 * as a {@link Directory}, {@link Group}, or {@link Organization}.  For full
 * documentation of this resource, please see
 * [REST API Reference: Account Store Mapping](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#account-store-mapping).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#getAccountStoreMappings Application.getAccountStoreMappings()}
 *
 * For more information about account store mappings, please see
 * [Modeling Your User Base](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#modeling-your-user-base).
 *
 * @param {object} accountStoreMappingResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function ApplicationAccountStoreMapping() {
  ApplicationAccountStoreMapping.super_.apply(this, arguments);
}

utils.inherits(ApplicationAccountStoreMapping, AccountStoreMapping);

/**
 * @description
 *
 * Gets the {@link Application} that is associated with this account store mapping.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request, e.g. to expand properties on the Application.
 *
 * @param {Function} callback
 * The callback to call when the operation is complete. Will be called with
 * (err, {@link Application}).
 */
ApplicationAccountStoreMapping.prototype.getApplication = function getApplication(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.application.href, args.options, require('./Application'), args.callback);
};

ApplicationAccountStoreMapping.prototype.setApplication = function setApplication(application) {
  this.application = { href: application.href };
  return this;
};

module.exports = ApplicationAccountStoreMapping;
