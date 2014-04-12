var common = require('./common');
var should = common.should;
var expect = common.expect;
var sinon = common.sinon;

var CacheHandler = require('../lib/cache/CacheHandler');

function rand(){
  return parseInt(Math.random() * 1000,10);
}

var CACHE_REGIONS = [
  'applications',
  'directories',
  'accounts',
  'groups',
  'groupMemberships',
  'tenants',
  'accountStoreMappings'
];

var regionCount = CACHE_REGIONS.length;

describe('Cache module',function(){

  describe('Cache Handler class', function(){
    describe('By default', function(){
      var handler = new CacheHandler();
      it('it should have a cache manager', function(){
        should.exist(handler.cacheManager);
      });
      it('it should have a caches', function(){
        should.exist(handler.cacheManager.caches);
      });
    });

    describe('With a global store for all regions', function(){
      var spy = sinon.spy();
      var cacheOptions= {
          store: spy
      };
      new CacheHandler({
        cacheOptions: cacheOptions
      });
      it('should call the provided store for every region', function(){
        expect(spy.callCount).to.equal(regionCount);
      });
    });

    describe('With a region specific store', function(){
      var spy1 = sinon.spy();
      var spy2 = sinon.spy();
      var cacheOptions= {
          store: spy1,
          regions: {
              accounts: {
                store: spy2
              }
          }
      };
      new CacheHandler({
        cacheOptions: cacheOptions
      });
      it('it should call the region store once', function(){
        expect(spy2.callCount).to.equal(1);
      });
      it('it should call the global store for all others', function(){
        expect(spy1.callCount).to.equal(regionCount-1);
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

      it('should call the store with the global options for every region', function(){
        CACHE_REGIONS.map(function(region){
          var regionOpts = handler.cacheManager.caches[region].store._options;
          expect(regionOpts.ttl).to.equal(cacheOptions.ttl);
          expect(regionOpts.tti).to.equal(cacheOptions.tti);
          expect(regionOpts.options.a).to.equal(cacheOptions.options.a);
          expect(regionOpts.options.b).to.equal(cacheOptions.options.b);
        });
      });

    });

    describe('With mixed global and region specific options', function(){

      var mockStore = function(opts){
        this._options = opts;
      };

      var regionUnderTest = "accounts";

      var cacheOptions= {
          ttl: rand(),
          tti: rand(),
          options: {
            a: rand(),
            b: rand()
          },
          store: mockStore,
          regions: {
            accounts: {
              ttl: rand(),
              tti: rand(),
              options: {
                a: rand(),
                b: rand()
              },
            }
          }
      };

      var handler = new CacheHandler({
        cacheOptions: cacheOptions
      });

      var OTHER_REGIONS = CACHE_REGIONS.filter(function(r){return r!==regionUnderTest;});

      it('should call the region sepcific store with the region specific options', function(){
          var regionOpts = handler.cacheManager.caches[regionUnderTest].store._options;
          expect(regionOpts.ttl).to.equal(cacheOptions.regions[regionUnderTest].ttl);
          expect(regionOpts.tti).to.equal(cacheOptions.regions[regionUnderTest].tti);
          expect(regionOpts.options.a).to.equal(cacheOptions.regions[regionUnderTest].options.a);
          expect(regionOpts.options.b).to.equal(cacheOptions.regions[regionUnderTest].options.b);
      });

      it('should call all other regions with the global options', function(){
        OTHER_REGIONS.map(function(region){
          var regionOpts = handler.cacheManager.caches[region].store._options;
          expect(regionOpts.ttl).to.equal(cacheOptions.ttl);
          expect(regionOpts.tti).to.equal(cacheOptions.tti);
          expect(regionOpts.options.a).to.equal(cacheOptions.options.a);
          expect(regionOpts.options.b).to.equal(cacheOptions.options.b);
        });
      });
    });

  });
});