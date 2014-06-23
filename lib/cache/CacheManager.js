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
  this.caches[region] = new Cache(options);
};

CacheManager.prototype.getCache = function (region) {
  return this.caches[region];
};

module.exports = CacheManager;