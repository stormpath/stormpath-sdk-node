'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function SamlProvider() {
  SamlProvider.super_.apply(this, arguments);
}

utils.inherits(SamlProvider, InstanceResource);

SamlProvider.prototype.getAttributeStatementMappingRules = function getAttributeStatementMappingRules(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.attributeStatementMappingRules.href, options, require('./SamlAttributeStatementMappingRules'), callback);
};

SamlProvider.prototype.getServiceProviderMetadata = function getServiceProviderMetadata(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.serviceProviderMetadata.href, options, require('./SamlServiceProviderMetadata'), callback);
};

module.exports = SamlProvider;
