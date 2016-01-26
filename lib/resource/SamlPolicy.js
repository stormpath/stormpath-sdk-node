'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function SamlPolicy() {
  SamlPolicy.super_.apply(this, arguments);
}

utils.inherits(SamlPolicy, InstanceResource);

SamlPolicy.prototype.getServiceProvider = function getServiceProvider(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.serviceProvider.href, args.options, require('./SamlServiceProvider'), args.callback);
};

module.exports = SamlPolicy;
