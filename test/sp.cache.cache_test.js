var common = require('./common');
var sinon = common.sinon;
var should = common.should;

var Cache = require('../lib/cache/cache');
var CacheStats = require('../lib/cache/stats');
var CacheEntry = require('../lib/cache/entry');
var MemoryStore = require('../lib/cache/MemoryStore');

describe('Cache module', function () {
  describe('Cache class', function () {
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

    describe('get entry', function () {
      var cache;
      before(function () {
        cache = new Cache();
      });

      describe('if entry exists', function () {
        var key = 'key';
        var data = 'entry';
        var entry;
        var hitsCounter;
        var initialTime = 100500;
        var tickDelta = 150;
        var sandbox;
        before(function (done) {
          sandbox = sinon.sandbox.create();
          var clock = sandbox.useFakeTimers(initialTime, 'Date');
          hitsCounter = cache.stats.hits;
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
        it('should find entry by key', function () {
          should.exist(entry);
          entry.should.be.equal(data);
        });
        it('should increase hit counter', function () {
          cache.stats.hits.should.be.equal(hitsCounter + 1);
        });
        it('should reset entry idle time', function (done) {
          cache.store.get(key, function (err, cache_entry) {
            cache_entry.lastAccessedAt.should.be
              .equal(cache_entry.createdAt + tickDelta);
            done();
          });
        });
      });

      describe('if entry does not exist', function () {
        it('should return null', function (done) {
          cache.get(Date.now(), function (err, entry) {
            should.not.exist(err);
            should.not.exist(entry);
            done();
          });
        });
      });

      describe('if entry expired', function () {
        var key = 'key2';
        var data = 'entry2';
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
          storeDeleteSpy.should.have.been.calledOnce;
          storeDeleteSpy.should.have.been.calledWith(key);
        });
        it('should return null', function(done){
          cache.get(key, function(err, ent){
            should.not.exist(err);
            should.not.exist(ent);
            done();
          });
        });
      });
    });

    describe('put entry', function () {
      var cache = new Cache();
      var key = 'key_' + Date.now();
      var data = 'data_' + Date.now();
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
        it('should be accessible from cache', function(done){
          cache.get(key, function(err, entry){
            should.exist(entry);
            entry.should.be.equal(data);
            done();
          });
        });
        it('should update stats', function(){
          statsPutSpy.should.have.been.calledOnce;
        });
      });
    });

    describe('delete entry', function () {
      var cache = new Cache();
      var key = 'key' + Date.now();
      var cb = function(){};
      var sandbox, statsDeleteSpy, storeDeleteSpy;
      before(function(){
        sandbox = sinon.sandbox.create();
        statsDeleteSpy = sandbox.spy(cache.stats, 'delete');
        storeDeleteSpy = sandbox.spy(cache.store, 'delete');

        cache.delete(key,cb);
      });
      after(function(){
        sandbox.restore();
      });
      it('should update stats', function(){
        statsDeleteSpy.should.have.been.calledOnce;
      });
      it('should remove entry from cache', function(){
        storeDeleteSpy.should.have.been.calledOnce;
        storeDeleteSpy.should.have.been.calledWith(key,cb);
      });
    });

    describe('clear cache', function () {
      var cache = new Cache();
      var cb = function(){};
      var sandbox, statsClearSpy, storeClearSpy;
      before(function(){
        sandbox = sinon.sandbox.create();
        statsClearSpy = sandbox.spy(cache.stats, 'clear');
        storeClearSpy = sandbox.spy(cache.store, 'clear');

        cache.clear(cb);
      });
      after(function(){
        sandbox.restore();
      });
      it('should reset stats', function(){
        statsClearSpy.should.have.been.calledOnce;
      });
      it('should remove all entries from cache', function(){
        storeClearSpy.should.have.been.calledOnce;
        storeClearSpy.should.have.been.calledWith(cb);
      });
    });

    describe('cache size', function () {
      var cache = new Cache();
      var cb = function(){};
      var sandbox, storeSizeSpy;
      before(function(){
        sandbox = sinon.sandbox.create();
        storeSizeSpy = sandbox.spy(cache.store, 'size');

        cache.size(cb);
      });
      after(function(){
        sandbox.restore();
      });
      it('should return size of cache', function(){
        storeSizeSpy.should.have.been.calledOnce;
        storeSizeSpy.should.have.been.calledWith(cb);
      });
    });
  });
});