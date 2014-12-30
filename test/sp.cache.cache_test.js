var common = require('./common');
var _ = common._;
var sinon = common.sinon;
var should = common.should;
var random = common.random;

var Cache = require('../lib/cache/Cache');
var CacheStats = require('../lib/cache/CacheStats');

var MemoryStore = require('../lib/cache/MemoryStore');
var MemcachedStore = require('../lib/cache/MemcachedStore');
var RedisStore = require('../lib/cache/RedisStore');

describe('Cache module', function () {
  "use strict";
  describe('Cache class', function () {
    describe('call to constructor', function () {
      it('should return an instance of Cache', function () {
        /* jshint -W064 */
        Cache().should.be.an.instanceof(Cache);
        /* jshint +W064 */
      });
    });

    describe('By default', function () {
      var cache;
      before(function () {
        cache = new Cache();
      });
      it('store should be a MemoryStore', function () {
        cache.store.constructor.name.should.be.an.equal(MemoryStore.name);
      });
      it('tti should be equal 300 sec', function () {
        cache.ttl.should.be.equal(300);
      });
      it('ttl should be equal 300 sec', function () {
        cache.tti.should.be.equal(300);
      });
      it('should initialize stats', function () {
        cache.stats.should.be.an.instanceof(CacheStats);
      });
    });

  });

  function testStore(opt) {
    var cache;
    before(function(){
      cache = opt.cache;
    });

    describe('get entry', function () {
      describe('if entry exists', function () {
        var sandbox, entry, hitsCounter;
        var key = 'key' + random();
        var key2 = 'key' + random();
        var data = 'entry' + random();
        var initialTime = 100500;
        var tickDelta = 150;
        before(function (done) {
          function createCacheWithDifferentTTL(cache, done) {
            cache.ttl = 300;
            cache.tti = 200;
            cache.put(key2, data, function () {
              clock.tick(tickDelta);
              cache.get(key2, function (err, ent) {
                entry = ent;
                done();
              });
            });
          }
          sandbox = sinon.sandbox.create();
          var clock = sandbox.useFakeTimers(initialTime, 'Date');
          hitsCounter = cache.stats.hits;
          cache.put(key, data, function () {
            clock.tick(tickDelta);
            cache.get(key, function (err, ent) {
              entry = ent;
              createCacheWithDifferentTTL(cache, done);
            });
          });
        });
        after(function () {
          sandbox.restore();
        });
        it('should find entry by key', function () {
          should.exist(entry);
          entry.should.be.equal(data);
        });
        it('should increase hit counter', function () {
          cache.stats.hits.should.be.equal(hitsCounter + 2);
        });
        it('should reset entry idle time if tti is less than ttl', function (done) {
          cache.store.get(key2, function (err, c_e) {
            c_e.lastAccessedAt.should.be
              .equal(c_e.createdAt + tickDelta);
            done();
          });
        });
        it('should not reset entry idle time if tti is equal to ttl', function (done) {
          cache.store.get(key, function (err, c_e) {
            c_e.lastAccessedAt.should.be
              .equal(c_e.createdAt);
            done();
          });
        });
      });

      describe('if entry does not exist', function () {
        it('should return null', function (done) {
          cache.get(random(), function (err, entry) {
            should.not.exist(err);
            should.not.exist(entry);
            done();
          });
        });
      });

      describe('if entry expired', function () {
        var key = 'key' +  random();
        var data = 'entry' + random();
        var entry;
        var missCounter;
        var initialTime = 100500;
        var tickDelta = 310 * 1000;
        var sandbox;
        var storeDeleteSpy;
        before(function (done) {
          sandbox = sinon.sandbox.create();
          var clock = sandbox.useFakeTimers(initialTime, 'Date');
          storeDeleteSpy = sandbox.spy(cache.store, 'delete');
          missCounter = cache.stats.misses;
          cache.put(key, data, function () {
            clock.tick(tickDelta);
            cache.get(key, function (err, ent) {
              entry = ent;
              done();
            });
          });
        });
        after(function () {
          sandbox.restore();
        });

        it('should increase miss counter', function () {
          cache.stats.misses.should.be.equal(missCounter + 1);
        });
        it('should delete entry from cache', function () {
          /* jshint -W030 */
          storeDeleteSpy.should.have.been.calledOnce;
          storeDeleteSpy.should.have.been.calledWith(key);
        });
        it('should return null', function (done) {
          cache.get(key, function (err, ent) {
            should.not.exist(err);
            should.not.exist(ent);
            done();
          });
        });
      });
    });

    describe('put entry', function () {
      var key = 'key' + random();
      var data = 'data' + random();
      var sandbox;
      var statsPutSpy;
      before(function (done) {
        sandbox = sinon.sandbox.create();
        statsPutSpy = sandbox.spy(cache.stats, 'put');
        cache.put(key, data, done);
      });
      after(function () {
        sandbox.restore();
      });
      describe('By default', function () {
        it('entry should be considered as new', function () {
          statsPutSpy.should.have.been.calledWith(true);
        });
      });

      describe('if we put an entry', function () {
        it('should be accessible from cache', function (done) {
          cache.get(key, function (err, entry) {
            should.exist(entry);
            entry.should.be.equal(data);
            done();
          });
        });
        it('should update stats', function () {
          /* jshint -W030 */
          statsPutSpy.should.have.been.calledOnce;
        });
      });
    });

    describe('delete entry', function () {
      var key = 'key' + random();
      var cb = function () {
      };
      var sandbox, statsDeleteSpy, storeDeleteSpy;
      before(function () {
        sandbox = sinon.sandbox.create();
        statsDeleteSpy = sandbox.spy(cache.stats, 'delete');
        storeDeleteSpy = sandbox.spy(cache.store, 'delete');

        cache.delete(key, cb);
      });
      after(function () {
        sandbox.restore();
      });
      it('should update stats', function () {
        /* jshint -W030 */
        statsDeleteSpy.should.have.been.calledOnce;
      });
      it('should remove entry from cache', function () {
        /* jshint -W030 */
        storeDeleteSpy.should.have.been.calledOnce;
        storeDeleteSpy.should.have.been.calledWith(key, cb);
      });
    });

    describe('clear cache', function () {
      var cb = function () {};
      var sandbox, statsClearSpy, storeClearSpy;
      before(function () {
        sandbox = sinon.sandbox.create();
        statsClearSpy = sandbox.spy(cache.stats, 'clear');
        storeClearSpy = sandbox.spy(cache.store, 'clear');

        cache.clear(cb);
      });
      after(function () {
        sandbox.restore();
      });
      it('should reset stats', function () {
        /* jshint -W030 */
        statsClearSpy.should.have.been.calledOnce;
      });
      it('should remove all entries from cache', function () {
        /* jshint -W030 */
        storeClearSpy.should.have.been.calledOnce;
        storeClearSpy.should.have.been.calledWith(cb);
      });
    });

    describe('cache size', function () {
      var cb = function () {
      };
      var sandbox, storeSizeSpy;
      before(function () {
        sandbox = sinon.sandbox.create();
        storeSizeSpy = sandbox.spy(cache.store, 'size');

        cache.size(cb);
      });
      after(function () {
        sandbox.restore();
      });
      it('should return size of cache', function () {
        /* jshint -W030 */
        storeSizeSpy.should.have.been.calledOnce;
        storeSizeSpy.should.have.been.calledWith(cb);
      });
    });

  }

  describe('Default store', function(){
    testStore({cache: new Cache()});
  });

  describe('MemoryStore store', function(){
    testStore({cache: new Cache(MemoryStore)});
  });

  describe('Redis store', function(){
    var opt = {cache:null}, sandbox;
    before(function(){
      sandbox = sinon.sandbox.create();
      var ms = new MemoryStore();
      _.extend(ms,{
        expire: function(){},
        del: ms.delete,
        flushdb: ms.clear,
        dbsize: ms.size
      });

      sandbox.stub(RedisStore, '_createClient', function(){
        return ms;
      });

      opt.cache = new Cache(RedisStore);
    });
    after(function(){
      sandbox.restore();
    });
    describe('...', function(){
      testStore(opt);
    });
  });

  describe('Memcached store', function(){
    var opt = {cache:null}, sandbox;
    before(function(){
      sandbox = sinon.sandbox.create();
      var ms = new MemoryStore();
      ms._set = ms.set;
      _.extend(ms,{
        expire: function(){},
        del: ms.delete,
        flush: ms.clear,
        stats: function(cb){
          ms.size(function(err, size){
            cb(null, [{curr_items:size}]);
          });
        }
      });

      sandbox.stub(ms, 'set', function(key,val, ttl, cb){
        return ms._set(key, val, cb);
      });
      sandbox.stub(MemcachedStore, '_createClient', function(){
        return ms;
      });

      opt.cache = new Cache(MemcachedStore);
    });
    after(function(){
      sandbox.restore();
    });
    describe('...', function(){
      testStore(opt);
    });
  });

});