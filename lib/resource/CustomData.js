'use strict';
var _ = require('underscore');
var async = require('async');
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

var RESERVED_FIELDS_HREF = ['href','createdAt', 'modifiedAt',
  'meta', 'spMeta', 'spmeta', 'ionmeta', 'ionMeta'];
var RESERVED_FIELDS = ['createdAt', 'modifiedAt',
  'meta', 'spMeta', 'spmeta', 'ionmeta', 'ionMeta'];

function CustomData() {
  CustomData.super_.apply(this, arguments);

  var _removedFields = null;
  Object.defineProperty(this, '_removedFields', {
    get: function getRemovedFields() {
      return _removedFields;
    },
    set: function setRemovedFields(removedFields) {
      _removedFields = removedFields;
    }
  });
  this._removedFields = [];
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
    self.dataStore.deleteResource({href: href}, callback);
  }

  async.eachLimit(self._removedFields, 5, removeField, function (err){
    if (err){
      return cb(err);
    }

    self._removedFields.length = 0;
    cb();
  });
};

CustomData.prototype._hasReservedFields = function hasReservedFields(){
  var self = this;
  return RESERVED_FIELDS.filter(function(field){
    return self.hasOwnProperty(field);
  }).length > 0;
};

/**
 * CustomData only resource that has reserved fields and can not be saved directly
 * @returns {object} - return instance of CustomData resource without reserved properties
 * @private
 */
CustomData.prototype._deleteReservedFields = function deleteReservedFields(){
  var resource = require('../resource/ResourceFactory').instantiate(CustomData, _.omit(this, RESERVED_FIELDS), null, this.dataStore);
  resource._removedFields = this._removedFields;
  return resource;
};

CustomData.prototype.get = function getCustomData(callback){
  return this.dataStore.getResource(this.href, null, CustomData, callback);
};

CustomData.prototype.remove = function removeCustomDataField(fieldName){
  if (fieldName in RESERVED_FIELDS_HREF){
    return this;
  }
  delete this[fieldName];
  this._removedFields.push(fieldName);
  return this;
};

CustomData.prototype.save = function saveCustomData(cb){
  var self = this;
  self._deleteRemovedProperties(function(){
    self.dataStore.saveResource(self._deleteReservedFields(), cb);
  });
};

module.exports = CustomData;