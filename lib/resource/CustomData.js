'use strict';
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function CustomData() {
  CustomData.super_.apply(this, arguments);
}
utils.inherits(CustomData, InstanceResource);

CustomData.prototype.remove = function(fieldName, callback){
  var href = this.href;
  href += this.href[this.href.length-1] !== '/'?'/':'';
  href += fieldName;
  this.dataStore.deleteResource(href, callback);
};

module.exports = CustomData;