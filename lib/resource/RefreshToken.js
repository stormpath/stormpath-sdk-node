'use strict';

var utils = require('../utils');

function RefreshToken() {
  RefreshToken.super_.apply(this, arguments);
}

utils.inherits(RefreshToken, require('./InstanceResource'));

module.exports = RefreshToken;
