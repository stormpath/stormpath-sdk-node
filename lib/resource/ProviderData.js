'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function ProviderData() {
  ProviderData.super_.apply(this, arguments);
}
utils.inherits(ProviderData, InstanceResource);

module.exports = ProviderData;