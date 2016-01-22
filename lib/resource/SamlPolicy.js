'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function SamlPolicy() {
  SamlPolicy.super_.apply(this, arguments);
}

utils.inherits(SamlPolicy, InstanceResource);

SamlPolicy.prototype.getServiceProvider = function getServiceProvider(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);

  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.serviceProvider.href, options, require('./SamlServiceProvider'), callback);
};

module.exports = SamlPolicy;
