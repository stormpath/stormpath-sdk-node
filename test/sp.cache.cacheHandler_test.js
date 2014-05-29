var common = require('./common');
var should = common.should;
var expect = common.expect;
var sinon = common.sinon;

var CacheHandler = require('../lib/cache/CacheHandler');

function rand(){
  return parseInt(Math.random() * 1000,10);
}

describe('Cache module',function(){

  describe('Cache Handler class', function(){
    describe('By default', function(){
      var handler = new CacheHandler();
      it('it should have a cache manager', function(){
        should.exist(handler.cacheManager);
      });
      it('it should have a cache', function(){
        should.exist(handler.cacheManager.cache);
      });
    });

    describe('With a global store', function(){
      var spy = sinon.spy();
      var cacheOptions= {
          store: spy
      };
      new CacheHandler({
        cacheOptions: cacheOptions
      });
      it('should call the provided store only once', function(){
        expect(spy.callCount).to.equal(1);
      });
    });

    describe('With global options', function(){

      var mockStore = function(opts){
        this._options = opts;
      };
      var cacheOptions= {
          ttl: rand(),
          tti: rand(),
          options: {
            a: rand(),
            b: rand()
          },
          store: mockStore
      };
      var handler = new CacheHandler({
        cacheOptions: cacheOptions
      });

      it('should call the store with the global options', function(){
          var options = handler.cacheManager.cache.store._options;
          expect(options.ttl).to.equal(cacheOptions.ttl);
          expect(options.tti).to.equal(cacheOptions.tti);
          expect(options.options.a).to.equal(cacheOptions.options.a);
          expect(options.options.b).to.equal(cacheOptions.options.b);
      });
    });
  });
});