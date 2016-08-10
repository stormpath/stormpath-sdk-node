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

CustomData.prototype.remove = function removeCustomDataField(fieldName){
  if (fieldName in RESERVED_FIELDS_HREF){
    return this;
  }
  delete this[fieldName];
  this._removedFields.push(fieldName);
  return this;
};

/**
 * Save changes to this custom data resource.
 *
 * @param {Function} callback
 * The function to call when the save operation is complete. Will be called
 * with the parameters (err, updatedCustomDataResource).
 */
CustomData.prototype.save = function saveCustomData(cb){
  var self = this;
  var resource;

  // If the user deleted any properties, then before we save() the new data,
  // we'll remove any deleted properties.
  self._deleteRemovedProperties(function(){

    // At this point, we've finished deleting any properties the user has
    // removed. So we are at an interesting point -- two things could be true
    // here:
    //
    //   - Either there is still data left to actually save(), or
    //   - There is no data to save, as the user ONLY deleted stuff.
    //
    // In the event of #2, we MUST ABORT the save(), otherwise we'll get an
    // error (as Stormpath will fail the API call if we try to save nothing).
    //
    // So what I'm doing below is this: explicitly avoiding a call to save() if
    // there is no data remaining.
    resource = self._deleteReservedFields();

    // We need to remove all of the non-data properties from the resource
    // before attempting to save() it. Since this is a CustomData object, we
    // have to remove all methods, as well as the href property.
    Object.keys(resource).forEach(function(key) {
      if (key === 'href' || typeof resource[key] === 'function') {
        delete resource[key];
      }
    });

    // Once we've finished *purging* the resource object, we can then either
    // skip the save(), or process it and continue.
    if (Object.keys(resource).length > 0) {
      return self.dataStore.saveResource(self._deleteReservedFields(), cb);
    }

    cb();
  });
};

module.exports = CustomData;
