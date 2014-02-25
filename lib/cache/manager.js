var Cache = require('./cache');
var utils = require('../underscore');

/**
 * Cache manager abstraction.
 * Handles all the different caches used by the SDK
 * @constructor
 */
function CacheManager(){
  var self = this;
  self.caches = {};

  Object.defineProperty(self, 'stats', function(){
    var stats = {};
    utils.each(self.caches, function(cache, region){
      stats[region] = cache.stats;
    });
    return stats;
  });
}

CacheManager.prototype.create = function(region, options){
  this.caches[region] = new Cache(options);
};

CacheManager.prototype.get = function(region){
  return this.caches[region];
};

module.exports = CacheManager;