'use strict';

var Cache = require('./Cache');
var _ = require('../underscore');

/**
 * Cache manager abstraction.
 * Handles all the different caches used by the SDK
 * @constructor
 */
function CacheManager() {
  var self = this;
  self.caches = {};

  Object.defineProperty(self, 'stats', {
    get: function () {
      var stats = {};
      _.each(self.caches, function (cache, region) {
        stats[region] = cache.stats;
      });
      return stats;
    }
  });
}

CacheManager.prototype.createCache = function (region, options) {
  this.caches[region] = new Cache(options);
};

CacheManager.prototype.getCache = function (region) {
  return this.caches[region];
};

module.exports = CacheManager;