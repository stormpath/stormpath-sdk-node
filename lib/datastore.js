'use strict';

var util = require('./util');
var RequestExecutor = require('./reqexec');
var instantiate = require('./resource').instantiate;
var Resource = require('./resource').Resource;
var InstanceResource = require('./resource').InstanceResource;

function DataStore(config) {
  if (!config) {
    throw new Error('config argument is required.');
  }
  this.requestExecutor = config.requestExecutor || new RequestExecutor(config);
  //TODO: support config.cacheManager, config.cacheRegionResolver, etc.
}
util.inherits(DataStore, Object);

/**
 * Returns the Resource identified by the specified href.
 *
 * Arguments:
 * <ol>
 *   <li>href (String) - required</li>
 *   <li>query (Object) - optional</li>
 *   <li>ctor (Function) - optional</li>
 *   <li>callback (Function) - required</li>
 * </ol>
 */
DataStore.prototype.getResource = function getResource() {

  var _this = this;
  var args = Array.prototype.slice.call(arguments);

  var href = args[0];
  var callback = args[args.length - 1];

  var query = null;
  var InstanceCtor = InstanceResource; //by default

  //check if query params supplied:
  if (args[1] instanceof Object && !(args[1] instanceof Function)) {
    query = args[1];
  }

  //check if a constructor function was supplied to instantiate a returned resource:
  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg instanceof Function && util.isAssignableFrom(Resource, secondToLastArg)) {
    InstanceCtor = secondToLastArg;
  }

  var request = {uri: href};
  if (query) {
    request.query = query;
  }

  this.requestExecutor.execute(request, function onGetResourceRequestResult(err, body) {
    if (err) {
      callback(err, null);
      return;
    }

    var resource = instantiate(InstanceCtor, body, query, _this);

    //TODO: cache resource when caching is supported

    callback(null, resource);
  });
};

DataStore.prototype.createResource = function createResource(parentHref, query, data, ctor, callback) {

  var _this = this;

  var targetHref = util.valueOf(parentHref);
  var q = util.valueOf(query);

  var request = {uri:targetHref, method: 'POST'};
  if (q) {
    request.query = q;
  }
  if (data) {
    request.body = data;
  }

  this.requestExecutor.execute(request, function onCreateResourceRequestResult(err, body) {
    if (err) {
      callback(err, null);
      return;
    }

    var returnedResource = instantiate(ctor, body, null, _this);

    //TODO cache returnedResource when caching is supported

    callback(null, returnedResource);
  });
};

DataStore.prototype.saveResource = function saveResource(resource, callback) {

  var _this = this;

  var href = util.valueOf(resource.href);

  var request = {uri:href, method: 'POST', body: resource};

  this.requestExecutor.execute(request, function onSaveResourceRequestResult(err, body) {
    if (err) {
      callback(err, null);
      return;
    }

    var returnedResource = instantiate(resource.constructor, body, null, _this);

    //TODO cache returnedResource when caching is supported

    callback(null, returnedResource);
  });
};

DataStore.prototype.deleteResource = function deleteResource(resource, callback) {

  var href = util.valueOf(resource.href);

  //TODO: uncache resource when caching is supported

  var request = {uri: href, method: 'DELETE'};

  this.requestExecutor.execute(request, function onDeleteResourceRequestResult(err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null); //no body for the callback
  });
};

module.exports = DataStore;





