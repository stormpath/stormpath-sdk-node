'use strict';

var util = require('util');
var InstanceResource = require('./resource').InstanceResource;

function Tenant() {
  Tenant.super_.apply(this, arguments);
}
util.inherits(Tenant, InstanceResource);

module.exports = Tenant;