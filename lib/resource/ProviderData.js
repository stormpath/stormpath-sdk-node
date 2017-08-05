'use strict';

var Resource = require('./Resource');
var SaveableMixin = require('./mixins/SaveableMixin');
var utils = require('../utils');

/**
 * @class ProviderData
 *
 * @description
 * Encapsulates a ProviderData resource of a {@link Account}. For full documentation of this resource, please see
 * [REST API Reference: ProviderData](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#provider-data).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Account#getProviderData Account.getProviderData()}.
 *
 * @augments {Resource}
 *
 * @param {Object} providerDataResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function ProviderData() {
  ProviderData.super_.apply(this, arguments);
}

utils.inherits(ProviderData, Resource);
utils.applyMixin(ProviderData, SaveableMixin);

module.exports = ProviderData;
