'use strict';

var utils = require('../utils');

function AccessToken() {
  AccessToken.super_.apply(this, arguments);
}

utils.inherits(AccessToken, require('./InstanceResource'));

module.exports = AccessToken;
