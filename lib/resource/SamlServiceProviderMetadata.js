'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function SamlServiceProviderMetadata() {
  SamlServiceProviderMetadata.super_.apply(this, arguments);
}

utils.inherits(SamlServiceProviderMetadata, InstanceResource);

module.exports = SamlServiceProviderMetadata;
