'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function ApiKey() {
  ApiKey.super_.apply(this, arguments);
}
utils.inherits(ApiKey, InstanceResource);

module.exports = ApiKey;