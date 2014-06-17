'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Provider() {
  Provider.super_.apply(this, arguments);
}
utils.inherits(Provider, InstanceResource);

module.exports = Provider;
