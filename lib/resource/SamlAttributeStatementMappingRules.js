'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function SamlAttributeStatementMappingRules() {
  SamlAttributeStatementMappingRules.super_.apply(this, arguments);
}

utils.inherits(SamlAttributeStatementMappingRules, InstanceResource);

module.exports = SamlAttributeStatementMappingRules;
