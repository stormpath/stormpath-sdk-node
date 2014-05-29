'use strict';

var Cache = require('./Cache');

/**
 * Cache manager abstraction.
 * Handles all the different caches used by the SDK
 * @constructor
 */
function CacheManager() {
  var self = this;
  self.cache = {};

  Object.defineProperty(self, 'stats', {
    get: function () {
      return self.cache.stats;
    }
  });
}

CacheManager.prototype.createCache = function (options) {
  this.cache = new Cache(options);
};

CacheManager.prototype.getCache = function () {
  return this.cache;
};

module.exports = CacheManager;