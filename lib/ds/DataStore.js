'use strict';

var utils = require('../utils');
var RequestExecutor = require('./RequestExecutor');
var Resource = require('../resource/Resource');
var InstanceResource = require('../resource/InstanceResource');
var instantiate = require('../resource/ResourceFactory').instantiate;

//Caching
var CacheHandler = require('../cache/CacheHandler');

/**
 * # DataStore
 *
 * A `DataStore` interacts with the REST API server on behalf of SDK users.
 *
 * The DataStore delegates raw request execution to an internal [RequestExecutor](RequestExecutor.js.html) instance.  In future SDK releases, the DataStore will also coordinate with a caching layer, reducing round trips to the server.
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
 * @param {Object} config.cacheOptions - cache manager options
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
  this.cacheHandler = config.cacheHandler || new CacheHandler(config);
}
utils.inherits(DataStore, Object);

function isResourceCtor(obj) {
  return obj && (obj instanceof Function) && utils.isAssignableFrom(Resource, obj);
}

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
DataStore.prototype.getResource = function getResource(/* href, [query], [InstanceConstructor], callback */) {

  var _this = this;
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var query = (args.length > 0 && !(args[0] instanceof Function)) ? args.shift() : null;
  var InstanceCtor = (args.length > 0 && isResourceCtor(args[0])) ? args.shift() : InstanceResource;

  var request = {uri: href};
  if (query) {
    request.query = query;
  }

  function onResourceResult(err, data, cb) {
    if (err) {
      return cb(err, null);
    }
    var instance = null;
    if (data) {
      instance = instantiate(InstanceCtor, data, query, _this);
    }
    return cb(null, instance);
  }

  //TODO: ignore cache if query is provided
  _this.cacheHandler.get(href, function onCacheResult(err, entry) {
    if (err || entry) {
      console.log(entry);
      return onResourceResult(err, entry, callback);
    }
    //not cached, query the server:
    return _this.requestExecutor.execute(request, function onGetResourceRequestResult(err, body) {
      if (!err && body) {
        _this.cacheHandler.put(href, body, utils.noop);
      }
      return onResourceResult(err, body, callback);
    });
  });
};

/**
 * Creates a new resource on the server as a child of the specified `parentHref` location (must be a collection resource endpoint).
 *
 * @param {String} parentHref the URI of the parent collection under which the new resource will be created as a child.  This must always be the first argument.
 * @param {Object=undefined} query  name/value pairs to use as query parameters to `parentHref`.
 * @param {Object} data the resource (name/value pairs) to send to the server.
 * @param {Function=InstanceResource} instanceCtor (optional, defaults to ``)  The Constructor function to invoke for any instance resource returned by the server.  If the request result is a single resource, this function is used to construct the resource.  If the request result is a collection, the `instanceCtor` is used to construct each resource in the collection's `items` field.
 * @param {Function} callback the callback function to invoke with the constructed Resource. `callback`'s first argument is an `Error`, the second is the constructed resource. `callback` must always be the last argument.
 * @return {void} no return value; the acquired resource is instead provided to `callback`.
 * @method createResource
 * @class DataStore
 * @api public
 * @version 0.1
 */
DataStore.prototype.createResource = function createResource(/* parentHref, [query], data, [InstanceConstructor], callback */) {

  var _this = this;
  var args = Array.prototype.slice.call(arguments);

  var parentHref = args.shift();
  var callback = args.pop();
  var ctor = (args.length > 0 && (args[args.length -1] instanceof Function)) ? args.pop() : InstanceResource;
  var data = args.pop();
  var query = (args.length > 0) ? args.pop() : null;

  if (!utils.isAssignableFrom(InstanceResource, ctor)) {
    throw new Error("If specifying a constructor function it must be equal to or a subclass of InstanceResource.");
  }

  var request = {uri: parentHref, method: 'POST'};
  if (query) {
    request.query = query;
  }
  if (data) {
    request.body = data;
  }

  _this.requestExecutor.execute(request, function onCreateResourceRequestResult(err, body) {
    if (err) {
      return callback(err, null);
    }

    var returnedResource = instantiate(ctor, body, null, _this);

    //cache for future use:
    _this.cacheHandler.put(body.href, body, utils.noop);

    return callback(null, returnedResource);
  });
};

DataStore.prototype.saveResource = function saveResource(resource, callback) {

  var _this = this;

  var href = utils.valueOf(resource.href);

  var request = {uri: href, method: 'POST', body: resource};

  _this.requestExecutor.execute(request, function onSaveResourceRequestResult(err, body) {
    if (err) {
      return callback(err, null);
    }

    var returnedResource = instantiate(resource.constructor, body, null, _this);

    //cache for future use:
    _this.cacheHandler.put(body.href, body, false, utils.noop);

    return callback(null, returnedResource);
  });
};

DataStore.prototype.deleteResource = function deleteResource(resource, callback) {

  var _this = this;

  var href = utils.valueOf(resource.href);

  //remove from cache:
  _this.cacheHandler.remove(href, utils.noop);

  var request = {uri: href, method: 'DELETE'};

  this.requestExecutor.execute(request, function onDeleteResourceRequestResult(err) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, null); //no body for the callback
  });
};

module.exports = DataStore;