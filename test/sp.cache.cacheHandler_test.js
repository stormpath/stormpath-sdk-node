var common = require('./common');
var should = common.should;
var expect = common.expect;
// var sinon = common.sinon;

var CacheHandler = require('../lib/cache/CacheHandler');


function rand(){
  return parseInt(Math.random() * 1000,10);
}

describe('CacheHandler',function(){

  describe('when constructed', function(){

    describe('without options', function(){
      var handler = new CacheHandler();
      it('it should have a cache manager', function(){
        should.exist(handler.cacheManager);
      });
      it('it should have a cache', function(){
        should.exist(handler.cacheManager.caches);
      });
      it('should create caches for each region', function(){
        expect(Object.keys(handler.cacheManager.caches))
          .to.deep.equal(CacheHandler.CACHE_REGIONS);
      });
    });

    describe('with a custom store constructor', function(){

      var MockStore = function(opts){
        this._options = opts;
      };
      var cacheOptions= {
          ttl: rand(),
          tti: rand(),
          options: {
            a: rand(),
            b: rand()
          },
          store: MockStore
      };
      var handler = new CacheHandler({
        cacheOptions: cacheOptions
      });

      it('should construct the custom store with the global options', function(){
          var customStoreInstance = handler.cacheManager.caches.applications.store;
          var options = customStoreInstance._options;
          expect(customStoreInstance instanceof MockStore).to.equal(true);
          expect(options.ttl).to.equal(cacheOptions.ttl);
          expect(options.tti).to.equal(cacheOptions.tti);
          expect(options.options.a).to.equal(cacheOptions.options.a);
          expect(options.options.b).to.equal(cacheOptions.options.b);
      });
    });

  });
});