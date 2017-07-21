'use strict';

var async = require('async');
var _ = require('underscore');

var ApiKey = require('../resource/ApiKey');
var ApiKeyEncryptedOptions = require('../authc/ApiKeyEncryptedOptions');
var CacheHandler = require('../cache/CacheHandler');
var InstanceResource = require('../resource/InstanceResource');
var NonceStore = require('./NonceStore');
var RequestExecutor = require('./RequestExecutor');
var instantiate = require('../resource/ResourceFactory').instantiate;
var noop = function (){};
var utils = require('../utils');

/**
 * @private
 *
 * @description
 *
 * Creates a new `DataStore` instance using the specified (required) `config`.
 * The required `config` argument must contain a `RequestExecutor` instance or
 * contain values that may be used to construct a `RequestExecutor` instance
 * (like an `apiKey`).
 *
 * A `DataStore` interacts with the REST API server on behalf of SDK users.
 *
 * The DataStore delegates raw request execution to an internal
 * [RequestExecutor](RequestExecutor.js.html) instance. In future SDK releases,
 * the DataStore will also coordinate with a caching layer, reducing round trips
 * to the server.
 *
 * It is important that the DataStore acts as an intermediary, decoupling
 * SDK users from raw request logic: because interaction goes through the DataStore,
 * additional features (like caching) can be added at any point in the future
 * without requiring changes to SDK users' code.
 *
 * @param {Object} config
 * Required configuration object that either provides a `requestExecutor` or
 * values that may be used to instantiate a `RequestExecutor`.
 *
 * @param {Object} config.cacheOptions
 * Cache manager options.
 */
function DataStore(config) {
  if (!config) {
    throw new Error('config argument is required.');
  }
  this.requestExecutor = config.requestExecutor || new RequestExecutor(config);
  this.cacheHandler = config.cacheHandler || new CacheHandler(config);
  this.nonceStore = config.nonceStore || new NonceStore(this);
  this.apiKeyEncryptionOptions = new ApiKeyEncryptedOptions(config.apiKeyEncryptionOptions);
  this.resourceRequestLogger = config.resourceRequestLogger;
  var _request = null;
  Object.defineProperty(this, '_request', {
    get: function(){return _request;},
    set: function(value){_request = value;}
  });
  this._request = {};
}
utils.inherits(DataStore, Object);

DataStore.prototype.tryToCacheOktaResource = function (resource, callback) {
  var href = resource._links && resource._links.self && resource._links.self.href;
  if (href) {
    this.cacheHandler.put(href, resource, callback);
  }
};

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
    async.parallel([
      instance._decrypt.bind(instance),
      _this.tryToCacheOktaResource.bind(_this, instance)
    ],function (err, results) {
      cb(err, err ? null : results[0]);
    });
  }
  else if(utils.isCollectionData(instance) &&
    instance.items[0] &&
    instance.items[0] instanceof ApiKey)
  {
    async.map(instance.items,function(item,next){
      item._setApiKeyMetaData(query);
      var selfHref = item._links && item._links.self && item._links.self.href;
      if (item._links.self.href) {
        item._links.self.href
      }
      _this.tryToCacheOktaResource(item, utils.noop);
      item._decrypt(next);
    },function(err){
      cb(err,instance);
    });
  }else if(data && !(data instanceof require('../cache/CacheEntry'))){
    _this.tryToCacheOktaResource(data, utils.noop);
    return cb(null, instance);
  }else{
    return cb(null, instance);
  }

};

/**
 * @private
 *
 * @description
 *
 * Queries the server for a resource by `href`, providing the result to `callback`.
 *
 * @param {String} href
 * The URI of the resource to acquire. This must always be the first argument.
 *
 * @param {Object} query [optional=undefined]
 * Key/value pairs to use as query parameters to `href`.
 *
 * @param {Function} instanceCtor [optional=InstanceResource]
 * The Constructor function to invoke for any Instance Resource returned by the server.
 * If the resource returned by the server is a single resource, this function is used to
 * construct the resource. If the resource returned by the server is a collection,
 * `instanceCtor` is used to construct each resource in the collection's `items` field.
 *
 * @param {Function} callback
 * The callback function to invoke with the constructed Resource. `callback`'s
 * first argument is an `Error` object if an error occured, the second is the
 * constructed resource. `callback` must always be the last argument.
 *
 * @return {void} no return value; the acquired resource is instead provided to `callback`.
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
    InstanceCtor: (args.length > 0 && args[0] instanceof Function) ? args.shift() : InstanceResource
  };

  function loggerProxy(err, resource) {

    // TODO - finish this idea of a "resourceRequestLogger" so that it is ready
    // for public consumption.  Until then, don't bloat resources with the requestData
    // object, though we need to keep it until this point so that we can make use
    // of the originalHref for caching of access token redirects.

    if (resource) {
      if (_this.resourceRequestLogger) {
        _this.resourceRequestLogger(resource.requestData);
      }
      delete resource.requestData;
    }

    callback.apply(null, arguments);
  }

  return _this.exec(loggerProxy);
};

/**
 * This is not used and will be removed in 1.0
 *
 * @private
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
 * This is not used and will be removed in 1.0
 *
 * @private
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
 * This is not used and will be removed in 1.0
 *
 * @private
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

/**
 * This is not used and will be removed in 1.0
 *
 * @private
 */
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

function applyRequestData(resource, data){
  resource.requestData = data;
}

/**
 * @private
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
  var begin = new Date().getTime();
  function doRequest(){
    try {
      _this.requestExecutor.execute(request, function onGetResourceRequestResult(err, body) {
        if (body) {
          applyRequestData(body, {
            begin: begin,
            end: new Date().getTime(),
            originalHref: request.uri,
            fromCache: false
          });
        }

        _this._wrapGetResourceResponse(err, body, ctor, query, callback);
      });
    } catch (err) {
      callback(err);
    }
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
      if (entry) {
        applyRequestData(entry, {
          begin: begin,
          end: new Date().getTime(),
          originalHref: request.uri,
          fromCache: true
        });
      }
      _this._wrapGetResourceResponse(err, entry, ctor, query, callback);
      return;
    }

    // Not cached, query the server.
    doRequest();
  });
};

/**
 * @private
 *
 * @description
 *
 * Creates a new resource on the server as a child of the specified `parentHref`
 * location (must be a collection resource endpoint).
 *
 * @param {String} parentHref
 * The URI of the parent collection under which the new resource will be created
 * as a child. This must always be the first argument.
 *
 * @param {Object} query [optional=null]
 * Key/value pairs to use as query parameters to `parentHref`.
 *
 * @param {Object} data
 * The resource (name/value pairs) to send to the server.
 *
 * @param {Function} instanceCtor [optional=InstanceResource]
 * The Constructor function to invoke for any Instance Resource returned by the server.
 * If the resource returned by the server is a single resource, this function is used to
 * construct the resource. If the resource returned by the server is a collection,
 * `instanceCtor` is used to construct each resource in the collection's `items` field.
 *
 * @param {Function} callback
 * The callback function to invoke with the constructed Resource. `callback`'s
 * first argument is an `Error` object if an error occured, the second is the
 * constructed resource. `callback` must always be the last argument.
 *
 * @return {void} no return value; the acquired resource is instead provided to `callback`.
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

  var request = { uri: parentHref, method: 'POST' };
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

    if (returnedResource instanceof ApiKey) {
      returnedResource._setApiKeyMetaData(query);
      _this.tryToCacheOktaResource(returnedResource, function (err) {
        if (err) {
          return callback(err);
        }

        return returnedResource._decrypt(callback);
      });
    } else {
      _this.tryToCacheOktaResource(body, utils.noop);
      return callback(null, returnedResource);
    }
  });
};

/**
 * @private
 *
 * @description
 *
 * Saves the provided resource by POSTing the resource to the href of the
 * resource.
 *
 * @param {Object} resource
 *
 * @param {String} resource.href The href of the resource to save
 *
 * @param {function} callback
 */
DataStore.prototype.saveResource = function saveResource(resource, callback) {
  var _this = this;

  var href = utils.valueOf(resource.href);
  callback = callback || noop;

  var request = {uri: href, method: 'PUT', body: resource};

  _this.requestExecutor.execute(request, function onSaveResourceRequestResult(err, body) {
    if (err) {
      return callback(err, null);
    }

    var returnedResource = instantiate(resource.constructor, body, null, _this);

    // Cache for future use.
    _this.tryToCacheOktaResource(body, utils.noop);

    return callback(null, returnedResource);
  });
};

/**
 * @private
 *
 * @description
 *
 * Deletes the provided resource by issuing a DELETE request agaisnt the href of
 * the resource.
 *
 * @param {Object} resource
 *
 * @param {String} resource.href The href of the resource to delete
 *
 * @param {function} callback
 */
DataStore.prototype.deleteResource = function deleteResource(resource, callback) {
  var _this = this;
  var href = utils.valueOf(resource.href);
  callback = callback || noop;

  // Remove from cache.
  _this.cacheHandler.remove(href, utils.noop);

  var request = {uri: href, method: 'DELETE'};

  this.requestExecutor.execute(request, function onDeleteResourceRequestResult(err) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, null); // No body for the callback.
  });
};

/**
 * @private
 *
 * @description

 * Private method to invalidate cache by HREF.
 *
 * @param {string} href
 * @param {function} callback
 */
DataStore.prototype._evict = function _evict(href, callback){
  this.cacheHandler.remove(href, callback);
};


/**
 * @typedef {Object} ExpansionOptions
 *
 * This object will pass the `expand` query parameter to the REST API when
 * making requests for individual resources.  The `expand` parameter allows you
 * to fetch linked resources in the same request, allowing you to make less
 * calls and warm your cache with the linked resources.
 *
 * @property {String} [expand]
 * A comma-separated list of linked resources that should be expanded on the
 * response from the REST API.
 *
 * @example
 *
 * client.getAccount({ expand: 'customData,groups' }, function(err, account){
 *
 *   // The custom data object is now populated on the account object:
 *
 *   console.log(account.customData)
 *
 *   // The first page of the groups collection is available as well:
 *
 *   console.log(account.groups.items)
 *
 *   // But if you need to all the groups, you should use the
 *   // the getter method and iterate through the collection:
 *
 *   account.getGroups(function(err, groupsCollection){
 *     groupsCollection.each(function(group){
 *       console.log(group);
 *     });
 *   });
 * });
 */

module.exports = DataStore;
