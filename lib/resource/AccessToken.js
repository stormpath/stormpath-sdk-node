'use strict';

var utils = require('../utils');

function AccessToken() {
  AccessToken.super_.apply(this, arguments);
  return this;
}

utils.inherits(AccessToken, require('./InstanceResource'));


module.exports = AccessToken;