'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Provider
 *
 * @description
 * Encapsulates a Provider resource of a {@link Directory}. For full documentation of this resource, please see
 * [REST API Reference: Provider](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#provider).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Directory#getProvider Directory.getProvider()}.
 *
 * @augments {InstanceResource}
 *
 * @param {Object} providerResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function Provider() {
  Provider.super_.apply(this, arguments);
}

utils.inherits(Provider, InstanceResource);

module.exports = Provider;
