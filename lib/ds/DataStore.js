'use strict';

var _ = require('underscore');
var utils = require('../utils');
var NonceStore = require('./NonceStore');
var RequestExecutor = require('./RequestExecutor');
var Resource = require('../resource/Resource');
var InstanceResource = require('../resource/InstanceResource');
var instantiate = require('../resource/ResourceFactory').instantiate;
var ApiKey = require('../resource/ApiKey');
var noop = function (){};
var async = require('async');

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
  this.nonceStore = config.nonceStore || new NonceStore(this);
  var _request = null;
  Object.defineProperty(this, '_request', {
    get: function(){return _request;},
    set: function(value){_request = value;}
  });
  this._request = {};
}
utils.inherits(DataStore, Object);

function isResourceCtor(obj) {
  return obj && (obj instanceof Function) && utils.isAssignableFrom(Resource, obj);
}

DataStore.prototype._wrapGetResourceResponse =
  function wrapGetResourceResponse(err, data, InstanceCtor, query, cb) {
  var _this = this;
  if (err) {
    return cb(err, null);
  }
  var instance = null;
  if (data) {
    instance = instantiate(InstanceCtor, data, query, this);
  }
  if(instance instanceof ApiKey){
    instance._decrypt(cb);
  }
  else if(utils.isCollectionData(instance) &&
    instance.items[0] &&
    instance.items[0] instanceof ApiKey)
  {
    async.map(instance.items,function(item,next){
      item._setApiKeyMetaData(query);
      _this.cacheHandler.put(item.href, item, utils.noop);
      item._decrypt(next);
    },function(err){
      cb(err,instance);
    });
  }else if(data && data.href){
    _this.cacheHandler.put(data.href, instance, utils.noop);
    return cb(null, instance);
  }else{
    return cb(null, instance);
  }

};

/**
 * Queries the server for a resource by `href`, providing the result to `callback`.
 *
 * @param {String} href the URI of the resource to acquire.  This must always be the first argument.
 * @param {Object} query [optional=undefined] name/value pairs to use as query parameters to `href`
 * @param {Function} instanceCtor [optional=InstanceResource] The Constructor function to invoke for any Instance Resource returned by the server.  If the resource returned by the server is a single resource, this function is used to construct the resource.  If the resource returned by the server is a collection, `instanceCtor` is used to construct each resource in the collection's `items` field.
 * @param {Function} callback the callback function to invoke with the constructed Resource. `callback`'s first argument is an `Error`, the second is the constructed resource.  `callback` must always be the last argument.
 * @return {void} no return value; the acquired resource is instead provided to `callback`.
 * @method getResource
 * @api public
 * @version 0.1
 */
DataStore.prototype.getResource = function getResource(/* href, [query], [InstanceConstructor], callback */) {
  var _this = this;
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();

  _this = _.clone(_this);

  _this._request = {
    href: href,
    query: (args.length > 0 && !(args[0] instanceof Function)) ? args.shift() : {},
    InstanceCtor: (args.length > 0 && isResourceCtor(args[0])) ? args.shift() : InstanceResource
  };

  return _this.exec(callback);
};

/**
 * Gets collection
 * @param {string|object} [query] - optional query
 * @param {function} [cb]
 */
DataStore.prototype.search = function (query, options, cb) {
  if (!query || typeof query === 'function') {
    throw new Error('Missing query argument in find request');
  }
  if (typeof options === 'function') {
    cb = options;
    options = query;
  }
  options = options || {};

  if (typeof query === 'string' && query.length > 0) {
    this._request.rawSearch = query;
  }

  if (_.isObject(query)) {
    this._request.search = query;
  }

  this._request.limit = options.limit;
  this._request.offset = options.offset;

  return this.exec(cb);
};

/**
 *
 * @param orderQuery - 'name', 'name asc', {field: -1} === 'field desc'
 */
DataStore.prototype.orderBy = function (orderQuery, cb) {
  var order = {};

  function isOrderDirection(word) {
    return (word === 'asc') || (word === 'desc');
  }

  if (typeof orderQuery === 'string') {
    var words = orderQuery.split(' ');
    for (var i = 0; i < words.length; i++) {
      if (isOrderDirection(words[i])) {
        continue;
      }
      order[words[i]] = ((i + 1) < words.length) && isOrderDirection(words[i + 1]) ?
        words[i + 1] : 'asc';
    }
  }
  if (_.isObject(orderQuery)) {
    _.each(orderQuery, function (val, field) {
      order[field] = (
        (val === -1) || (val === false) || (val === 'desc')) ? 'desc' : 'asc';
    });
  }

  this._request.order = order;
  return this.exec(cb);
};

/**
 *
 * @param {string|object} expand - 'tenant directory' | {tenant:true} |
 * {tenant: {offset:0, limit:15}}
 * @param {function} cb
 */
DataStore.prototype.expand = function (expand, cb) {
  var exp = {};
  if (typeof expand === 'string') {
    var words = expand.split(' ');
    _.each(words, function (word) {
      exp[word] = true;
    });
  }

  if (_.isObject(expand)) {
    exp = expand;
  }
  this._request.expand = exp;
  return this.exec(cb);
};

// return object, do not bind to collection
DataStore.prototype.lean = function (lean) {
  this._request.lean = lean !== false;
  return this;
};

DataStore.prototype._buildRequestQuery = function(){
  var queryStringObj = {};
  if (this._request.rawSearch) {
    queryStringObj.q = this._request.rawSearch;
  }

  if (this._request.search) {
    _.each(this._request.search, function (val, name) {
      queryStringObj[name] = val;
    });
  }

  if (this._request.limit) {
    queryStringObj.limit = this._request.limit;
  }

  if (this._request.offset) {
    queryStringObj.offset = this._request.offset;
  }

  if (this._request.order) {
    var orderByBuf = [];
    _.each(this._request.order, function(direction, name){
      orderByBuf.push(name + (direction !== 'asc' ? ' desc': ''));
    });
    queryStringObj.orderBy = orderByBuf.join(',');
  }

  if (this._request.expand){
    var expandBuf = [];
    _.each(this._request.expand, function(val, name){
      if (val === true || val === 1){
        return expandBuf.push(name);
      }
      return expandBuf.push(name + '(offset:'+val.offset+',limit:'+val.limit+')');
    });

    queryStringObj.expand = expandBuf.join(',');
  }
  return queryStringObj;
};

/**
 *
 * @param callback
 * @returns {object}
 */
DataStore.prototype.exec = function executeRequest(callback){
  var _this = this;

  if (!callback){
    return _this;
  }

  var query = _.extend({}, _this._request.query, _this._buildRequestQuery());
  var request = {
    uri: _this._request.href,
    query: query
  };

  var ctor = _this._request.InstanceCtor;

  function doRequest(){
    _this.requestExecutor.execute(request, function onGetResourceRequestResult(err, body) {
      _this._wrapGetResourceResponse(err, body, ctor, query, callback);
    });
  }
  if (
    ( (Object.keys(query).length > 0 ) ||
      utils.isAssignableFrom(ctor,require('../resource/CollectionResource'))
    ) && (ctor!==ApiKey)

    ){
    return doRequest();
  }

  var href = _this._request.href;

  var cacheKey = ctor === ApiKey ? href.replace(/applications.*/,'apiKeys/'+query.id) : href;

  _this.cacheHandler.get(cacheKey, function onCacheResult(err, entry) {
    if (err || entry) {
      _this._wrapGetResourceResponse(err, entry, ctor, query, callback);
      return;
    }

    //not cached, query the server:
    doRequest();
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
  callback = callback || noop;

  if (!utils.isAssignableFrom(InstanceResource, ctor)) {
    throw new Error("If specifying a constructor function, it must be for class equal to or a subclass of InstanceResource.");
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

    if(returnedResource instanceof ApiKey){
      returnedResource._setApiKeyMetaData(query);
      _this.cacheHandler.put(returnedResource.href, returnedResource, function(err){
        if(err){
          callback(err);
        }else{
          return returnedResource._decrypt(callback);
        }
      });
    }else{
      _this.cacheHandler.put(body.href, body, utils.noop);
      return callback(null, returnedResource);
    }
  });
};

DataStore.prototype.saveResource = function saveResource(resource, callback) {

  var _this = this;

  var href = utils.valueOf(resource.href);
  callback = callback || noop;

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
  callback = callback || noop;
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

/**
 * Private method fo cache invalidation by href
 * @param {string} href
 * @param {function} callback
 * @private
 */
DataStore.prototype._evict = function _evict(href, callback){
  this.cacheHandler.remove(href, callback);
};

module.exports = DataStore;