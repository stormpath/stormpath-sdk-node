'use strict';

var async = require('async');

var _ = require('../underscore');
var Cache = require('./Cache');
var CacheManager = require('./CacheManager');
var DisabledCache = require('./DisabledCache');
var utils = require('../utils');

var CACHE_REGIONS = ['applications', 'directories', 'accounts', 'groups',
  'groupMemberships', 'tenants', 'accountStoreMappings','apiKeys','idSiteNonces',
  'customData'];

// singleton of DisabledCache wrapped into Cache instance
var disabledCache = new Cache({store: DisabledCache});

// private function
function getCacheCtor(cache){
  if (!cache){
    return;
  }

  if (typeof cache === 'function'){
    return cache;
  }

  function runtimeLoad(moduleRef){
    return require(moduleRef);
  }

  var cacheCtors = {
    disabled: runtimeLoad('./DisabledCache'),
    memory: runtimeLoad('./MemoryStore'),
    memcached: runtimeLoad('./MemcachedStore'),
    redis: runtimeLoad('./RedisStore')
  };

  if (!(cache in cacheCtors)){
    throw new Error('Unsupported cache provider: ' + cache);
  }

  return cacheCtors[cache];
}

// * Example of a object with all available options::
//{
//  store: 'redis',
//  connection: {
//    host: 'localhost',
//    port: 6739,
//  },
//  options: {},
//  ttl: 300,
//  tti: 300
//}

function CacheHandler(config) {
  var self = this;
  config = config || {};
  var options = config.cacheOptions || {};
  options.store = getCacheCtor(options.store);

  self.cacheManager = config.cacheManager || new CacheManager();
  CACHE_REGIONS.map(function(region) {
    self.cacheManager.createCache(region,options);
  });

}

//private function:
function getCacheByHref(cacheManager, href) {

  var region = null;

  //href is almost never null, but it is in the case of an AuthenticationResult (at the moment), so check for existence:
  //see: https://github.com/stormpath/stormpath-sdk-node/issues/11
  if (href) {
    region = href.match(/customData/) ? 'customData' : (href.split('/').slice(-2)[0]);
  }

  if (!region || CACHE_REGIONS.indexOf(region) === -1) {
    return disabledCache;
  }

  return cacheManager.getCache(region) || new DisabledCache();
}

CacheHandler.prototype.get = function getCachedResource(href, callback) {
  var _this = this;
  return getCacheByHref(_this.cacheManager, href).get(href, callback);
};

/*
  Expect an object, which would be a JSON response from our API,
  which is searched for resources which can be cached. To be cached
  a resource must have an href and some other propeties.

  It returns an array of objects which can be passed on to the
  cache manager for caching in the appropriate regions

*/
function buildCacheableResourcesFromParentObject(object){
  var resourcesToCache = [];
  var parentResource = {};
  if(utils.isCollectionData(object)){
    object.items.forEach(function(resource) {
      Array.prototype.push.apply(resourcesToCache, buildCacheableResourcesFromParentObject(resource));
    });
  }else{
    _.pairs(object).forEach(function(pair) {
      var prop = pair[0];
      var val = pair[1];
      if(val && val.href && _.keys(val).length>1){
        Array.prototype.push.apply(resourcesToCache, buildCacheableResourcesFromParentObject(val));
        parentResource[prop] = {
          href: val.href
        };
      }else{
        parentResource[prop] = val;
      }
    });
    if(parentResource.href){
      resourcesToCache.push(parentResource);
    }
  }
  return resourcesToCache;
}

CacheHandler.prototype.put = function cacheResource(href, data, _new, cb) {
  var _this = this;

  if (typeof _new === 'function') {
    cb = _new;
    _new = true;
  }

  async.each(
    buildCacheableResourcesFromParentObject(data),
    function(resource,next) {
      getCacheByHref(_this.cacheManager, resource.href)
        .put(resource.href, resource, _new, next);
    },
    cb
  );

};

CacheHandler.prototype.remove = function removeCachedResource(href, callback) {
  var _this = this;
  return getCacheByHref(_this.cacheManager, href).delete(href, callback);
};

module.exports = CacheHandler;
module.exports.CACHE_REGIONS = CACHE_REGIONS;

