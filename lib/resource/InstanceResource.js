'use strict';

var async = require('async');

var Resource = require('./Resource');
var utils = require('../utils');

/**
 * @class InstanceResource
 *
 * Low-level resource wrapper for Stormpath resource objects.
 */
function InstanceResource() {
  InstanceResource.super_.apply(this, arguments);
}
utils.inherits(InstanceResource, Resource);

/**
 * @private
 *
 * @description
 *
 * Retrieves a linked resource by href or property reference.
 *
 * @param {Object|String} Resource reference. This should be a object literal
 * with a `href` property that identifies the resource to retrieve.
 *
 * @param {Object} query [optional=undefined]
 * Key/value pairs to use as query parameters to the resource.
 *
 * @param {Function} instanceCtor [optional=InstanceResource]
 * The constructor function to invoke for the resource returned by the server.
 *
 * @param {Function} callback
 * The callback function to invoke with the constructed Resource. `callback`'s
 * first argument is an `Error` object if an error occured, the second is the
 * constructed resource.
 */
InstanceResource.prototype.get = function getResource() {
  var args = Array.prototype.slice.call(arguments);

  var propName = args[0];
  var callback = args[args.length - 1];

  var val = this[propName];

  if (!val) {
    var e1 = new Error('There is no field named \'' + propName + '\'.');
    callback(e1, null);
    return;
  }
  if (!val.href) {
    var e2 = new Error('Field \'' + propName + '\' is not a reference property - it is not an object with an \'href\'' +
      'property.  Do not call \'get\' for ' +
      'non reference properties - access them normally, for example: resource.fieldName or resource[\'fieldName\']');
    callback(e2, null);
    return;
  }

  var query = null;
  var ctor = null;

  // Check if query params are supplied.
  if (args[1] instanceof Object && !(args[1] instanceof Function)) {
    query = args[1];
  }

  // Check if a constructor function was supplied to instantiate a returned resource.
  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg instanceof Function && utils.isAssignableFrom(Resource, secondToLastArg)) {
    ctor = secondToLastArg;
  }

  this.dataStore.getResource(val.href, query, ctor, callback);
};

InstanceResource.prototype._applyCustomDataUpdatesIfNecessary = function applyCustomDataUpdatesIfNecessary(cb){
  if (!this.customData){
    return cb();
  }

  if (this.customData._hasReservedFields()){
    this.customData = this.customData._deleteReservedFields();
  }

  if (this.customData._hasRemovedProperties()){
    return this.customData._deleteRemovedProperties(cb);
  }

  return cb();
};

/**
 * Save changes to this resource.
 *
 * @param {Function} callback
 * The function to call when the save operation is complete. Will be called
 * with the parameters (err, updatedResource).
 */
InstanceResource.prototype.save = function saveResource(callback) {
  var self = this;
  self._applyCustomDataUpdatesIfNecessary(function () {
    self.dataStore.saveResource(self, callback);
  });
};

/**
 * Deletes this resource from the API.
 *
 * @param {Function} callback
 * The function to call when the delete operation is complete. Will be called
 * with the parameter (err).
 */
InstanceResource.prototype.delete = function deleteResource(callback) {
  this.dataStore.deleteResource(this, callback);
};

/**
 * Removes this resource, and all of it's linked resources, e.g. Custom Data, from the local cache.
 *
 * @param {Function} callback
 * The function to call when the cache invalidation operation is complete.
 */
InstanceResource.prototype.invalidate = function invalidateResource(callback) {
  var self = this;

  var tasks = [];
  var visited = {};

  function makeInvalidationTask(href) {
    return function (itemCallback) {
      // Swallow any errors. For cache invalidation those aren't that
      // important and will also break the async.parallel() flow.
      self.dataStore._evict(href, function () {
        itemCallback();
      });
    };
  }

  function walkBuildInvalidationTasks(source) {
    var rootHref = source.href;

    if (rootHref in visited) {
      return;
    }

    visited[rootHref] = null;
    tasks.push(makeInvalidationTask(source.href));

    for (var key in source) {
      var item = source[key];

      if (!item || !item.href) {
        continue;
      }

      // Only walk child resources.
      if (item.href.indexOf(rootHref) === 0) {
        walkBuildInvalidationTasks(item);
      }
    }
  }

  if (this.href) {
    walkBuildInvalidationTasks(this);
  }

  async.parallel(tasks, callback);
};

module.exports = InstanceResource;
