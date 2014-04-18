'use strict';
var async = require('async');
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

var RESERVED_FIELDS = ['href', 'createdAt', 'modifiedAt',
  'meta', 'spMeta', 'spmeta', 'ionmeta', 'ionMeta'];

function CustomData() {
  CustomData.super_.apply(this, arguments);
}
utils.inherits(CustomData, InstanceResource);

CustomData.prototype._hasRemovedProperties = function hasRemovedProperties(){
  return 0 !== this._removedFields.length;
};

CustomData.prototype._deleteRemovedProperties = function deleteRemovedProperties(cb){
  var self = this;

  function removeField(fieldName, callback){
    var href = self.href;
    href += self.href[self.href.length-1] !== '/'?'/':'';
    href += fieldName;
    self.dataStore.deleteResource(href, callback);
  }

  async.eachLimit(self._removedFields, 5, removeField, function (err){
    if (err){
      return cb(err);
    }

    self._removedFields.length = 0;
    cb();
  });
};

CustomData.prototype._removedFields = [];

CustomData.prototype.remove = function(fieldName){
  if (fieldName in RESERVED_FIELDS){
    return this;
  }
  delete this[fieldName];
  this._removedFields.push(fieldName);
  return this;
};

CustomData.prototype.save = function saveCustomData(){
  var self = this;
  var args = arguments;
  self._deleteRemovedProperties(function(){
    CustomData.super_.prototype.save.apply(self, args);
  });
};

module.exports = CustomData;