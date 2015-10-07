'use strict';

var utils = require('../utils');

function RefreshToken() {
  RefreshToken.super_.apply(this, arguments);
  return this;
}

utils.inherits(RefreshToken, require('./InstanceResource'));


module.exports = RefreshToken;