'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function SamlServiceProvider() {
  SamlServiceProvider.super_.apply(this, arguments);
}

utils.inherits(SamlServiceProvider, InstanceResource);

module.exports = SamlServiceProvider;
