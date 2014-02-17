'use strict';

var util = require('./util');
var RequestExecutor = require('./reqexec');
var instantiate = require('./resource').instantiate;
var Resource = require('./resource').Resource;
var InstanceResource = require('./resource').InstanceResource;

/**
 * # DataStore
 *
 * A `DataStore` interacts with the REST API server on behalf of SDK users.
 *
 * The DataStore delegates raw request execution to an internal [RequestExecutor](reqexec.js.html) instance.  In future SDK releases, the DataStore will also coordinate with a caching layer, reducing round trips to the server.
 *
 * It is important that the DataStore acts as an intermediary, decoupling SDK users from raw request logic:  because interaction goes through the DataStore, additional features (like caching) can be added at any point in the future without requiring changes to SDK users' code.
 * @since 0.1
 * @class DataStore
 */

/**
 * Creates a new `DataStore` instance using the specified (required) `config`.
 *
 * The required `config` argument must contain a `requestExecutor` instance or contain values that may be used to construct a `RequestExecutor` instance (like an `apiKey`).
 *
 * @param {Object} config required configuration object that either provides a `requestExecutor` or values that may be used to instantiate a `RequestExecutor`.
 * @class DataStore
 * @constructor
 * @api public
 * @version 0.1
 * @see RequestExecutor
 */
function DataStore(config) {
  if (!config) {
    throw new Error('config argument is required.');
  }
  this.requestExecutor = config.requestExecutor || new RequestExecutor(config);
  //TODO: support config.cacheManager, config.cacheRegionResolver, etc.
}
util.inherits(DataStore, Object);

/**
 * Queries the server for a resource by `href`, providing the result to `callback`.
 *
 * @param {String} href the URI of the resource to acquire.  This must always be the first argument.
 * @param {Object} query [optional=undefined] name/value pairs to use as query parameters to `href`
 * @param {Function} instanceCtor [optional=InstanceResource] The Constructor function to invoke for any Instance Resource returned by the server.  If the resource returned by the server is a single resource, this function is used to construct the resource.  If the resource returned by the server is a collection, `instanceCtor` is used to construct each resource in the collection's `items` field.
 * @param {Function} callback the callback function to invoke with the constructed Resource. `callback`'s first argument is an `Error`, the second is the constructed resource.  `callback` must always be the last argument.
 * @return {void} no return value; the acquired resource is instead provided to `callback`.
 * @method getResource
 * @class DataStore
 * @api public
 * @version 0.1
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

/**
 * Creates a new resource on the server as a child of the specified `parentHref` location (must be a collection resource endpoint).
 *
 * @param {String} parentHref the URI of the parent collection under which the new resource will be created as a child.  This must always be the first argument.
 * @param {Object} query (optional, defaults to `undefined`) name/value pairs to use as query parameters to `parentHref`.
 * @param {Object} data the resource (name/value pairs) to send to the server.
 * @param {Function} instanceCtor (optional, defaults to `InstanceResource`)  The Constructor function to invoke for any instance resource returned by the server.  If the request result is a single resource, this function is used to construct the resource.  If the request result is a collection, the `instanceCtor` is used to construct each resource in the collection's `items` field.
 * @param {Function} callback the callback function to invoke with the constructed Resource. `callback`'s first argument is an `Error`, the second is the constructed resource. `callback` must always be the last argument.
 * @return {void} no return value; the acquired resource is instead provided to `callback`.
 * @method createResource
 * @class DataStore
 * @api public
 * @version 0.1
 */
DataStore.prototype.createResource = function createResource() {

  var _this = this;
  var args = Array.prototype.slice.call(arguments);

  var parentHref = args[0];
  var query = null;
  var data = null;
  var ctor = null;
  var callback = args[args.length - 1];

  var secondToLast = args[args.length - 2];
  if (secondToLast instanceof Function) {
    if (!util.isAssignableFrom(Resource, secondToLast)) {
      throw new Error('If specifying a constructor function, it must be equal to, or a subclass of, InstanceResource.');
    }
    ctor = secondToLast;
  }

  if (ctor) { //optional constructor function was specified
    data = args[args.length - 3];
  } else {
    data = secondToLast;
  }

  var secondArg = args[1];
  if (secondArg) {
      if (secondArg !== data) {
        //query was provided:
        query = secondArg;
      }
  }

  var request = {uri:parentHref, method: 'POST'};
  if (query) {
    request.query = query;
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





