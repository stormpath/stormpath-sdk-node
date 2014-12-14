'use strict';

var Cache = require('./Cache');

/**
 * Cache manager abstraction.
 * Handles all the different caches used by the SDK
 * @constructor
 */
function CacheManager() {
  var self = this;
  self.caches = {};
  self._existingStore = null;

  Object.defineProperty(self, 'stats', {
    get: function () {
      return Object.keys(self.caches).reduce(function(a,region){
        a[region] = self.caches[region].stats;
        return a;
      },{});
    }
  });
}

CacheManager.prototype.createCache = function (region,options) {
    if (this._existingStore) {
      this.caches[region] = this._existingStore;
    } else {
      var newCache = new Cache(options);
      this.caches[region] = newCache;
      if (newCache.store.constructor.name === 'RedisStore') {
        this._existingStore = newCache;
      }      
    }
};

CacheManager.prototype.getCache = function (region) {
  return this.caches[region];
};

module.exports = CacheManager;