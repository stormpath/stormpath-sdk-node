'use strict';

var _ = require('underscore');
var async = require('async');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

var RESERVED_FIELDS_HREF = ['href','createdAt', 'modifiedAt',
  'meta', 'spMeta', 'spmeta', 'ionmeta', 'ionMeta'];
var RESERVED_FIELDS = ['createdAt', 'modifiedAt',
  'meta', 'spMeta', 'spmeta', 'ionmeta', 'ionMeta'];

/**
 * @class CustomData
 *
 * @description
 *
 * Encapsulates a CustomData resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Custom Data](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#custom-data).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#getCustomData Account.getCustomData()}
 * - {@link Application#getCustomData Application.getCustomData()}
 * - {@link Directory#getCustomData Directory.getCustomData()}
 * - {@link Group#getCustomData Group.getCustomData()}
 * - {@link Organization#getCustomData Organization.getCustomData()}
 * - {@link Tenant#getCustomData Tenant.getCustomData()}
 *
 * @param {Object} customDataResource
 *
 * The JSON representation of this resource.
 *
 * @example
 * account.getCustomData(function(err, customData){
 *   customData.favoriteColor = 'blue';
 *   customData.save(function(err){
 *     if(!err) {
 *       console.log('Favorite color was saved');
 *     }
 *   });
 * });
 */

function CustomData(customData, dataStore, account) {

  var _removedFields = null;
  Object.defineProperty(this, '_removedFields', {
    get: function getRemovedFields() {
      return _removedFields;
    },
    set: function setRemovedFields(removedFields) {
      _removedFields = removedFields;
    }
  });
  Object.defineProperty(this, 'account', {
    enumerable: false,
    value: account
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

CustomData.prototype.remove = function removeCustomDataField(fieldName){
  if (fieldName in RESERVED_FIELDS_HREF){
    return this;
  }
  delete this[fieldName];
  this._removedFields.push(fieldName);
  return this;
};

CustomData.prototype.save = function saveCustomData(callback) {
  var self = this;
  var data = {
    href: self.account.href,
    profile: self.account.toOktaUser().profile
  };
  self.account.dataStore._evict(self.account.href, function () {
    self.account.dataStore.saveResource(data, callback);
  });
};

module.exports = CustomData;
