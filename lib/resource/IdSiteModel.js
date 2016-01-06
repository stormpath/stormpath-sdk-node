'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function IdSiteModel() {
  IdSiteModel.super_.apply(this, arguments);
}

utils.inherits(IdSiteModel, InstanceResource);

module.exports = IdSiteModel;
