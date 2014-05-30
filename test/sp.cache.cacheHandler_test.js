var common = require('./common');
var should = common.should;
var expect = common.expect;
var sinon = common.sinon;
var assert = common.assert;

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
        should.exist(handler.cacheManager.caches);
      });
    });

    describe('With a global store', function(){
      var spy = sinon.spy();
      var cacheOptions= {
          store: spy
      };
      var handler = new CacheHandler({
        cacheOptions: cacheOptions
      });
      it('should create caches for each region', function(){
        expect(Object.keys(handler.cacheManager.caches))
          .to.deep.equal(CacheHandler.CACHE_REGIONS);
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
          var options = handler.cacheManager.caches['applications'].store._options;
          expect(options.ttl).to.equal(cacheOptions.ttl);
          expect(options.tti).to.equal(cacheOptions.tti);
          expect(options.options.a).to.equal(cacheOptions.options.a);
          expect(options.options.b).to.equal(cacheOptions.options.b);
      });
    });

    describe('put method with collection response',function(){

      var cbSpy = sinon.spy();

      var apiKeyResponse = {
        "href": "https://api.stormpath.com/v1/applications/1234/apiKeys",
        "items": [
          {
            "account": {
              "href": "https://api.stormpath.com/v1/accounts/8897"
            },
            "href": "https://api.stormpath.com/v1/apiKeys/5678",
            "id": "5678",
            "secret": "secret",
            "status": "ENABLED",
            "tenant": {
              "href": "https://api.stormpath.com/v1/tenants/abc123"
            }
          }
        ],
        "limit": 25,
        "offset": 0
      };

      var cacheHandler = new CacheHandler();

      before(function(done){
        cacheHandler.put(apiKeyResponse.href,apiKeyResponse,
          function(err){
            if(err){
              throw err;
            }else{
              cacheHandler.get(apiKeyResponse.items[0].href,function(){
                cbSpy.apply(null,arguments);
                done();
              });
            }
          }
        );
      });
      it('it should cache the items',function(){
        assert.deepEqual(cbSpy.args[0][1],apiKeyResponse.items[0]);
      });
    });
  });
});