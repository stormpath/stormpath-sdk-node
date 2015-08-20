'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function Strength() {
  Strength.super_.apply(this, arguments);
}

utils.inherits(Strength, InstanceResource);
module.exports = Strength;
