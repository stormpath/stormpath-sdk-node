'use strict';

var utils = require('../utils');
var Resource = require('./Resource');
var SaveableMixin = require('./mixins/Saveable');

/**
 * @class SamlAttributeStatementMappingRules
 *
 * @augments Resource
 * @mixes SaveableMixin
 *
 * @description
 *
 * Encapsulates a AttributeStatementMappingRules resource.
 * For more information about this resource, please see:
 * [REST API Reference: Configure SAML Attribute Mapping](https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#step-7-configure-saml-attribute-mapping-optional).
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
 * - {@link SamlProvider#getAttributeStatementMappingRules SamlProvider.getAttributeStatementMappingRules()}
 *
 * @param {Object} attributeStatementMappingRules
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
function SamlAttributeStatementMappingRules() {
  SamlAttributeStatementMappingRules.super_.apply(this, arguments);
}

utils.inherits(SamlAttributeStatementMappingRules, Resource);
utils.applyMixin(SamlAttributeStatementMappingRules, SaveableMixin);

module.exports = SamlAttributeStatementMappingRules;
