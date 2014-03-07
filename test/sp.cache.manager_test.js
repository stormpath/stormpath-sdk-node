var common = require('./common');
var should = common.should;

var CacheManager = require('../lib/cache/CacheManager');

describe('Cache module',function(){

  describe('Cache Manager class', function(){
    describe('By default', function(){
      var manager = new CacheManager();
      it('caches should be empty', function(){
        /* jshint -W030 */
        manager.caches.should.be.empty;
      });
      it('stats should be empty', function(){
        /* jshint -W030 */
        manager.stats.should.be.empty;
      });
    });

    describe('create cache for region',function(){
      var manager = new CacheManager();
      var region = 'region' + Date.now();
      before(function(){
        manager.createCache(region);
      });
      it('should create cache instance for region', function(){
        var cache = manager.getCache(region);
        should.exist(cache);
      });
      it('should add stats for region', function (){
        var region_stats = manager.stats[region];
        should.exist(region_stats);
      });
    });

    describe('get cache by region',function(){
      var manager = new CacheManager();
      var region = 'region' + Date.now();
      before(function(){
        manager.createCache(region);
      });
      it('should return cache instance for region', function(){
        var cache = manager.getCache(region);
        should.exist(cache);
      });
      it('should return undefined if not found', function(){
        var cache = manager.getCache(Date.now());
        should.not.exist(cache);
      });
    });
  });
});