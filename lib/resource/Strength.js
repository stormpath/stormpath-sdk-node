'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Strength() {
  Strength.super_.apply(this, arguments);
}

utils.inherits(Strength, InstanceResource);
module.exports = Strength;
