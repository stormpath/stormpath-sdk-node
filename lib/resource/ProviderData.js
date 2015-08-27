'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function ProviderData() {
  ProviderData.super_.apply(this, arguments);
}
utils.inherits(ProviderData, InstanceResource);

module.exports = ProviderData;
