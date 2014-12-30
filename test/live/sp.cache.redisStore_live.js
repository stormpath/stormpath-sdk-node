var common = require('../common');
var should = common.should;
var random = common.random;

var Cache = require('../../lib/cache/Cache');
var RedisStore = require('../../lib/cache/RedisStore');

var redis = require('redis');

var redisActionTests = function(redisStore) {
    describe('set entry', function () {
      var key = 'key' + random();
      var val = 'val' + random();
      var entry;
      before(function (done) {
        redisStore.put(key, val, function () {
          redisStore.get(key, function (err, ent) {
            entry = ent;
            done();
          });
        });
      });
      after(function (done) {
        redisStore.delete(key, done);
      });
      it('should store value', function () {
        should.exist(entry);
      });
      it('stored value should be accessible', function () {
        entry.should.be.equal(val);
      });
    });

    describe('get entry', function () {
      var key = 'key' + random();
      var val = 'val' + random();
      before(function (done) {
        redisStore.put(key, val, done);
      });
      after(function (done) {
        redisStore.delete(key, done);
      });

      it('should return entry if found', function (done) {
        redisStore.get(key, function (err, entry) {
          should.not.exist(err);
          should.exist(entry);
          entry.should.be.equal(val);
          done();
        });
      });
      it('should return null if not found', function (done) {
        redisStore.get(random(), function (err, entry) {
          should.not.exist(err);
          should.not.exist(entry);
          done();
        });
      });
    });

    describe('delete entry', function () {
      var key = 'key' + random();
      var val = 'val' + random();
      before(function (done) {
        redisStore.put(key, val, done);
      });
      it('should remove entry from store', function (done) {
        redisStore.delete(key, function () {
          redisStore.get(key, function (err, entry) {
            should.not.exist(entry);
            done();
          });
        });
      });
    });

    describe('clear cache', function () {
      var key = 'key' + random();
      var val = 'val' + random();
      before(function (done) {
        redisStore.put(key, val, done);
      });
      it('should remove all entries from store', function (done) {
        redisStore.clear(function () {
          redisStore.get(key, function (err, entry) {
            should.not.exist(entry);
            done();
          });
        });
      });
    });

    describe('cache size', function () {
      var key = 'key' + random();
      var val = 'val' + random();
      before(function (done) {
        redisStore.clear(function(){
          redisStore.put(key, val, done);
        });
      });
      it('should return store size', function (done) {
        redisStore.size(function (err, size) {
          size.should.be.equal(1);
          done();
        });
      });
    });
};

describe('Redis cache', function () {
  describe('without a predefined redis client', function () {
    var redisStore = new Cache(RedisStore);
    redisActionTests(redisStore);
  });
  describe('with a predefined redis client', function () {
    var redisStore = new Cache({
      store: RedisStore,
      client: redis.createClient()
    });
    redisActionTests(redisStore);
  });
});
