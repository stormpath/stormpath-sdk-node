'use strict';

var _ = require('../underscore');
var DisabledCache = require('./DisabledCache');
var utils = require('../utils');
var CacheManager = require('./CacheManager');

var CACHE_REGIONS = ['applications', 'directories', 'accounts', 'groups',
  'groupMemberships', 'tenants', 'accountStoreMappings'];

/*
 * TODO: ensure displays in generated docs
 * Example of a dictionary with all available options::
 {
 'store': MemoryStore,
 'regions': {
 'applications': {
 'store': RedisStore,
 'ttl': 300,
 'tti': 300,
 'store_opts': {
 'host': 'localhost',
 'port': 6739,
 },
 },
 'directories': {
 'store': MemoryStore,
 'ttl': 60,
 },
 },
 }
 */

function CacheHandler(config) {

  var self = this;

  var cacheManager = null;

  if (config && config.cacheManager) {
    cacheManager = config.cacheManager;
  } else {
    cacheManager = new CacheManager();
  }

  self.cacheManager = cacheManager;

  var cacheOptions = config.cacheOptions || {};

  _.each(CACHE_REGIONS, function (region) {
    var opts = cacheOptions[region] || {};
    if (!opts.store && !!cacheOptions.store) {
      opts.store = cacheOptions.store;
    }
    self.cacheManager.createCache(region, opts);
  });
}

//private function:
function getCacheByHref(cacheManager, href) {

  var region = null;

  //href is almost never null, but it is in the case of an AuthenticationResult (at the moment), so check for existence:
  //see: https://github.com/stormpath/stormpath-sdk-node/issues/11
  if (href) {
    region = href.split('/').slice(-2)[0];
  }

  if (!region || CACHE_REGIONS.indexOf(region) === -1) {
    return new DisabledCache();
  }

  return cacheManager.getCache(region) || new DisabledCache();
}

CacheHandler.prototype.get = function getCachedResource(href, callback) {
  var _this = this;
  return getCacheByHref(_this.cacheManager, href).get(href, callback);
};

CacheHandler.prototype.put = function cacheResource(href, data, _new, cb) {

  var _this = this;

  if (typeof _new === 'function'){
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

