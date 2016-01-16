var common = require('./common');
var should = common.should;

var MemoryStore = require('../lib/cache/MemoryStore');

describe('Cache module', function () {

  describe('In memory cache store', function () {
    var memoryStore;

    before(function () {
      memoryStore = new MemoryStore();
    });

    describe('set entry', function () {
      var key;
      var val;
      var entry;

      before(function (done) {
        key = 'key' + Date.now();
        val = 'val' + Date.now();

        memoryStore.set(key, val, function () {
          memoryStore.get(key, function (err, ent) {
            entry = ent;
            done();
          });
        });
      });
      after(function (done) {
        memoryStore.delete(key, done);
      });
      it('should store value', function () {
        should.exist(entry);
      });
      it('stored value should be accessible', function () {
        entry.should.be.equal(val);
      });
    });

    describe('get entry', function () {
      var key;
      var val;

      before(function (done) {
        key = 'key' + Date.now();
        val = 'val' + Date.now();

        memoryStore.set(key, val, done);
      });
      after(function (done) {
        memoryStore.delete(key, done);
      });

      it('should return entry if found', function (done) {
        memoryStore.get(key, function (err, entry) {
          should.not.exist(err);
          should.exist(entry);
          entry.should.be.equal(val);
          done();
        });
      });
      it('should return null if not found', function (done) {
        memoryStore.get(Date.now(), function (err, entry) {
          should.not.exist(err);
          should.not.exist(entry);
          done();
        });
      });
    });

    describe('delete entry', function () {
      var key;
      var val;

      before(function (done) {
        key = 'key' + Date.now();
        val = 'val' + Date.now();

        memoryStore.set(key, val, done);
      });
      it('should remove entry from store', function (done) {
        memoryStore.delete(key, function () {
          memoryStore.get(key, function (err, entry) {
            should.not.exist(entry);
            done();
          });
        });
      });
    });

    describe('clear cache', function () {
      var key;
      var val;

      before(function (done) {
        key = 'key' + Date.now();
        val = 'val' + Date.now();

        memoryStore.set(key, val, done);
      });
      it('should remove all entries from store', function (done) {
        memoryStore.clear(function () {
          memoryStore.get(key, function (err, entry) {
            should.not.exist(entry);
            done();
          });
        });
      });
    });

    describe('cache size', function () {
      var key;
      var val;

      before(function (done) {
        key = 'key' + Date.now();
        val = 'val' + Date.now();

        memoryStore.clear(function(){
          memoryStore.set(key, val, done);
        });
      });
      it('should return store size', function (done) {
        memoryStore.size(function (err, size) {
          size.should.be.equal(1);
          done();
        });
      });
    });
  });
});
