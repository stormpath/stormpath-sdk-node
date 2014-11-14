'use strict';

var _ = require('../underscore');
var utils = require('../utils');
var Cache = require('./Cache');
var DisabledCache = require('./DisabledCache');
var CacheManager = require('./CacheManager');
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

CacheHandler.prototype.put = function cacheResource(href, data, _new, cb) {
  var _this = this;

  if (typeof _new === 'function') {
    cb = _new;
    _new = true;
  }

  var resourceData = {};

  _.each(data, function (val, name) {

    var v2;

    if (val && val.href) {

      v2 = {href: val.href};

      if (val.items) {

        v2.items = [];

        _.each(val.items, function (item) {
          _this.put(item.href, item, utils.noop);
          v2.items.push({href: item.href});
        });

      } else {
        if (Object.keys(val).length > 1) {
          _this.put(val.href, val, utils.noop);
        }
      }

    } else {
      v2 = val;
    }
    resourceData[name] = v2;

  });


  getCacheByHref(_this.cacheManager, href).put(href, resourceData, _new, cb);
};

CacheHandler.prototype.remove = function removeCachedResource(href, callback) {
  var _this = this;
  return getCacheByHref(_this.cacheManager, href).delete(href, callback);
};

module.exports = CacheHandler;
module.exports.CACHE_REGIONS = CACHE_REGIONS;

