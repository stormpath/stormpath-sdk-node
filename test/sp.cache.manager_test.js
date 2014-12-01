var common = require('./common');
var should = common.should;
var expect = common.expect;

var CacheManager = require('../lib/cache/CacheManager');

describe('Cache module',function(){

  describe('Cache Manager class', function(){
    describe('By default', function(){
      var manager = new CacheManager();
      it('cache should be empty', function(){
        /* jshint -W030 */
        manager.caches.should.deep.equal({});
      });
      it('stats should be empty', function(){
        /* jshint -W030 */
        expect(manager.stats).deep.equal({});
      });
    });

    describe('create cache',function(){
      var manager = new CacheManager();
      var region = common.uuid();
      before(function(){
        manager.createCache(region);
      });
      it('should create cache instance', function(){
        should.exist(manager.getCache(region));
      });
      it('should add stats', function (){
        should.exist(manager.stats);
      });
    });

    describe('get cache',function(){
      var manager = new CacheManager();
      var region = common.uuid();
      before(function(){
        manager.createCache(region);
      });
      it('should return cache instance', function(){
        should.exist(manager.getCache(region));
      });
    });
  });
});