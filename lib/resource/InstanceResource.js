'use strict';

var async = require('async');

var Resource = require('./Resource');
var utils = require('../utils');

function InstanceResource() {
  InstanceResource.super_.apply(this, arguments);
}
utils.inherits(InstanceResource, Resource);

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

  //check if query params supplied:
  if (args[1] instanceof Object && !(args[1] instanceof Function)) {
    query = args[1];
  }

  //check if a constructor function was supplied to instantiate a returned resource:
  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg instanceof Function && utils.isAssignableFrom(Resource, secondToLastArg)) {
    ctor = secondToLastArg;
  }

  this.dataStore.getResource(val.href, query, ctor, callback);
};

InstanceResource.prototype.save = function saveResource(callback) {
  this.dataStore.saveResource(this, callback);
};

InstanceResource.prototype.delete = function deleteResource(callback) {
  this.dataStore.deleteResource(this, callback);
};

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
