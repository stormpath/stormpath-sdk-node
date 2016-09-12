'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class IdSiteModel
 *
 * @description
 * Encapsulates a IdSiteModel resource. For full documentation of this resource, please see
 * [REST API Reference: ID Site](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#id-site).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Organization#getIdSiteModel Organization.getIdSiteModel()}
 * - {@link Tenant#getIdSites Tenant.getIdSites()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} idSiteModelResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function IdSiteModel() {
  IdSiteModel.super_.apply(this, arguments);
}

utils.inherits(IdSiteModel, InstanceResource);

module.exports = IdSiteModel;
