'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function Provider() {
  Provider.super_.apply(this, arguments);
}
utils.inherits(Provider, InstanceResource);

module.exports = Provider;