'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function SamlProvider() {
  SamlProvider.super_.apply(this, arguments);
}

utils.inherits(SamlProvider, InstanceResource);

SamlProvider.prototype.getAttributeStatementMappingRules = function getAttributeStatementMappingRules(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.attributeStatementMappingRules.href, args.options, require('./SamlAttributeStatementMappingRules'), args.callback);
};

SamlProvider.prototype.getServiceProviderMetadata = function getServiceProviderMetadata(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.serviceProviderMetadata.href, args.options, require('./SamlServiceProviderMetadata'), args.callback);
};

module.exports = SamlProvider;
