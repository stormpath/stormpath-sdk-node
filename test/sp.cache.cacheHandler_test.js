var common = require('./common');
var should = common.should;
var expect = common.expect;
var sinon = common.sinon;

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

  describe('.put()',function(){
    var cacheHandler,
      sandbox,
      acountRegionPutSpy,
      groupRegionPutSpy,
      directoryRegionPutSpy,
      customDataRegionPutSpy;

    describe('with a resource result',function(){
      var result = {
        href: '/v1/accounts/' + common.uuid(),
        username: common.uuid()
      };

      before(function(done) {
        cacheHandler = new CacheHandler();
        sandbox = sinon.sandbox.create();
        acountRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.accounts, 'put');
        cacheHandler.put(result.href,result,done);
      });

      it('should call .put() on the cache for the region of this resource',function() {
        expect(acountRegionPutSpy.args[0][0]).to.equal(result.href);
        expect(acountRegionPutSpy.args[0][1]).to.deep.equal(result);
      });
    });

    describe('with a resource result that cotains an expanded collection and a linked resource',function(){
      var parentResourceHref = '/v1/accounts/' + common.uuid();
      var result = {
        'href': parentResourceHref,
        'username': common.uuid(),
        'groups': {
          'href': parentResourceHref + '/groups',
          'offset': 0,
          'limit': 50,
          'size': 2,
          'items': [
            {
              'href': '/v1/groups/' + common.uuid(),
              'name': common.uuid()
            },
            {
              'href': '/v1/groups/' + common.uuid(),
              'name': common.uuid()
            }
          ]
        },
        'directory': {
          'href': '/v1/directories/' + common.uuid()
        }
      };
      before(function(done) {
        cacheHandler = new CacheHandler();
        sandbox = sinon.sandbox.create();
        acountRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.accounts, 'put');
        groupRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.groups, 'put');
        directoryRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.directories, 'put');
        cacheHandler.put(result.href,result,done);
      });
      it('should call .put() on the cache for the region of the parent resource',function() {
        expect(acountRegionPutSpy.args[0][0]).to.equal(result.href);
      });
      it('should call .put() on the cache for the region of the expanded resources, for each in the collection',function() {
        expect(groupRegionPutSpy.args[0][0]).to.equal(result.groups.items[0].href);
        expect(groupRegionPutSpy.args[1][0]).to.equal(result.groups.items[1].href);
      });
      it('should NOT call .put() on the cache for the region of the linked resource',function() {
        expect(directoryRegionPutSpy.args.length).to.equal(0);
      });
    });

    describe('with a collection result',function(){
      var collectionHref = 'http://api.stormpath.com/v1/tenants/'+common.uuid()+'/groups';
      var collectionResult = {
        'href': collectionHref,
        'offset': 0,
        'limit': 50,
        'size': 2,
        'items': [
          {
            'href': 'http://api.stormpath.com/v1/groups/' + common.uuid(),
            'name': common.uuid()
          },
          {
            'href': 'http://api.stormpath.com/v1/groups/' + common.uuid(),
            'name': common.uuid()
          }
        ]
      };
      before(function(done) {
        cacheHandler = new CacheHandler();
        sandbox = sinon.sandbox.create();
        groupRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.groups, 'put');
        cacheHandler.put(collectionResult.href,collectionResult,done);
      });
      it('should call .put() on the cache for the region of each of the resources in the collection',function() {
        expect(groupRegionPutSpy.args[0][0]).to.equal(collectionResult.items[0].href);
      });
    });

    describe('with a collection result where the collection items have expansions',function(){
      var collectionHref = 'http://api.stormpath.com/v1/tenants/'+common.uuid()+'/groups?expand=customData';
      var groupId1 = common.uuid();
      var groupId2 = common.uuid();
      var collectionResult = {
        'href': collectionHref,
        'offset': 0,
        'limit': 50,
        'size': 2,
        'items': [
          {
            'href': 'http://api.stormpath.com/v1/groups/' + groupId1,
            'name': common.uuid(),
            'customData': {
              'href': 'http://api.stormpath.com/v1/groups/' + groupId1 + '/customData',
              'createdAt': new Date().toISOString()
            }
          },
          {
            'href': 'http://api.stormpath.com/v1/groups/' + groupId2,
            'name': common.uuid(),
            'customData': {
              'href': 'http://api.stormpath.com/v1/groups/' + groupId2 + '/customData',
              'createdAt': new Date().toISOString()
            }
          }
        ]
      };
      before(function(done) {
        cacheHandler = new CacheHandler();
        sandbox = sinon.sandbox.create();
        groupRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.groups, 'put');
        customDataRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.customData, 'put');
        cacheHandler.put(collectionResult.href,collectionResult,done);
      });
      it('should call .put() on the cache for the region of each of the resources in the collection',function() {
        expect(groupRegionPutSpy.args[0][0]).to.equal(collectionResult.items[0].href);
        expect(groupRegionPutSpy.args[1][0]).to.equal(collectionResult.items[1].href);
      });
      it('should call .put() on the cache for the region of each of the expanded resources of the collection items',function() {
        expect(customDataRegionPutSpy.args[0][0]).to.equal(collectionResult.items[0].customData.href);
        expect(customDataRegionPutSpy.args[1][0]).to.equal(collectionResult.items[1].customData.href);
      });
    });


    describe('with a resource result that contains an expanded resource',function(){
      var result = {
        href: '/v1/accounts/' + common.uuid(),
        username: common.uuid(),
        directory: {
          href: '/v1/directories/' + common.uuid(),
          name: common.uuid()
        }
      };
      before(function(done) {
        cacheHandler = new CacheHandler();
        sandbox = sinon.sandbox.create();
        acountRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.accounts, 'put');
        directoryRegionPutSpy = sandbox.spy(cacheHandler.cacheManager.caches.directories, 'put');
        cacheHandler.put(result.href,result,done);
      });
      it('should call .put() on the cache for the region of the parent resource',function() {
        expect(acountRegionPutSpy.args[0][0]).to.equal(result.href);
      });
      it('should call .put() on the cache for the region of the expanded resource',function() {
        expect(directoryRegionPutSpy.args[0][0]).to.equal(result.directory.href);
      });
      it('should preserve the hrefs, but not the propeties, of the linked resources',function(){
        expect(acountRegionPutSpy.args[0][1].directory.href).to.equal(result.directory.href);
        expect(acountRegionPutSpy.args[0][1].directory.name).to.equal(undefined);
      });
    });

  });
});