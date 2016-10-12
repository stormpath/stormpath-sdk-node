'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

/**
 * @class IdSite
 *
 * @description
 * Encapsulates a IdSite resource. For full documentation of this resource, please see
 * [REST API Reference: ID Site](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#id-site).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Organization#getIdSite Organization.getIdSite()}
 * - {@link Tenant#getIdSites Tenant.getIdSites()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} idSiteResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function IdSite() {
  IdSite.super_.apply(this, arguments);
}

utils.inherits(IdSite, InstanceResource);

module.exports = IdSite;
