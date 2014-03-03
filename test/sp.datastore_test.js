var common = require('./common');
var _ = common._;
var sinon = common.sinon;
var should = common.should;
var utils = require('../lib/utils');

var DataStore = require('../lib/datastore');
var RequestExecutor = require('../lib/reqexec');
var MemoryStore = require('../lib/cache/MemoryStore');
var InstanceResource = require('../lib/resource').InstanceResource;

function random() {
  return Math.floor(Math.random() * Date.now());
}

describe('data store module', function () {
  describe('data store class', function () {

    describe('constructor', function () {
      describe('if request executor not provided in config', function () {
        var ds = new DataStore({apiKey: {id: 1, secret: 2}});
        it('should create instance of default RequestExecutor', function () {
          ds.requestExecutor.should.be.an.instanceof(RequestExecutor);
        });
      });

      describe('if request executor was provided in config', function () {
        var reqExec = new RequestExecutor({apiKey: {id: 1, secret: 2}});
        var ds = new DataStore({requestExecutor: reqExec});
        it('should reuse provided request executor instance', function () {
          ds.requestExecutor.should.be.equal(reqExec);
        });
      });

      describe('if cache options was not provided', function () {
        var ds = new DataStore({apiKey: {id: 1, secret: 2}});
        it('should not create caches', function () {
          should.not.exist(ds.caches);
        });
      });

      describe('if config not provided', function () {
        function createDataStoreWithoutConfig() {
          return new DataStore();
        }

        it('should throw "config argument is required"', function () {
          createDataStoreWithoutConfig.should.throw(/config argument is required/i);
        });
      });

      describe('for all provided regions', function () {
        var CACHE_REGIONS = ['applications', 'directories', 'accounts', 'groups',
          'groupMemberships', 'tenants', 'accountStoreMappings'];
        var cacheOptions = {};
        _.each(CACHE_REGIONS, function (region) {
          cacheOptions[region] = {};
        });
        var ds = new DataStore({cacheOptions: cacheOptions,
          apiKey: {id: 1, secret: 2}});
        _.each(CACHE_REGIONS, function (region) {
          it('should create cache instance for ' + region, function () {
            should.exist(ds.cacheManager.getCache(region));
          });
        });

      });
    });

    describe('storing recursive response object', function () {
      var data = {
        'href': 'http://example.com/accounts/FOO',
        'name': 'Foo',
        'groups': {
          'href': 'http://example.com/accounts/FOO/groups',
          'items': [
            {
              'href': 'http://example.com/groups/G1',
              'name': 'Foo Group 1'
            },
            {
              'href': 'http://example.com/groups/G2',
              'name': 'Foo Group 2'
            }
          ]
        },
        'directory': {
          'href': 'http://example.com/directories/BAR',
          'name': 'Directory'
        }
      };
      var ds = new DataStore({
        cacheOptions: {
          store: MemoryStore,
          accounts: {},
          groups: {},
          directories: {}
        },
        apiKey: {id: 1, secret: 2}
      });

      var cbSpy = sinon.spy();
      var sandbox, reqExecSpy,
        accountsCachePutSpy,
        groupsCachePutSpy,
        directoryCachePutSpy;

      before(function () {
        sandbox = sinon.sandbox.create();
        accountsCachePutSpy = sandbox.spy(ds.cacheManager.getCache('accounts'), 'put');
        groupsCachePutSpy = sandbox.spy(ds.cacheManager.getCache('groups'), 'put');
        directoryCachePutSpy = sandbox.spy(ds.cacheManager.getCache('directories'), 'put');
        reqExecSpy = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
          cb(null, data);
        });

        // act
        ds.getResource(data.href, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      it('should store root entity', function () {
        accountsCachePutSpy.should.have.been.calledOnce;
        accountsCachePutSpy.should.have.been.calledWith(data.href, {
          'href': 'http://example.com/accounts/FOO',
          'name': 'Foo',
          'groups': {
            'href': 'http://example.com/accounts/FOO/groups',
            'items': [
              {'href': 'http://example.com/groups/G1'},
              {'href': 'http://example.com/groups/G2'},
            ]
          },
          'directory': {
            'href': 'http://example.com/directories/BAR'
          }}, true);
      });
      it('should store all nested entities', function () {
        _.each(data.groups.items, function (group) {
          groupsCachePutSpy.should.have.been
            .calledWith(group.href, group, true, utils.noop);
        });

        directoryCachePutSpy.should.have.been
          .calledWith(data.directory.href, data.directory, true, utils.noop);
      });
    });

    describe('get resource', function () {
      var region = 'tenants';
      var ds = new DataStore({
        cacheOptions: {
          store: MemoryStore,
          tenants: {
            store: MemoryStore,
            ttl: 60,
            tti: 60
          },
          directories: {
            ttl: 120,
            tti: 120
          }
        },
        apiKey: {id: 1, secret: 2}
      });

      describe('required params', function () {
        it('should throw error if href is not defined', function () {
          ds.getResource.should.throw();
        });

        it('should throw error if callback is not defined', function () {
          ds.getResource.should.throw();
        });
      });

      describe('if href already cached', function () {
        var href = '/tenants/1' + random();
        var data = {data: random()};
        var cbSpy = sinon.spy();
        var sandbox, cacheGetSpy, reqExecSpy;
        before(function (done) {
          sandbox = sinon.sandbox.create();
          reqExecSpy = sandbox.spy(ds.requestExecutor, 'execute');
          var cache = ds.cacheManager.getCache(region);
          cacheGetSpy = sandbox.spy(cache, 'get');
          cache.put(href, data, true, done);
        });
        after(function () {
          sandbox.restore();
        });

        it('should return entry from cache', function () {
          ds.getResource(href, cbSpy);

          cacheGetSpy.should.have.been.calledOnce;
          cacheGetSpy.should.have.been.calledWith(href);

          reqExecSpy.should.not.been.called;

          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWith(null);
        });
      });

      // todo: tbd - ignore cache if query param provided
      /*      describe('if query provided', function(){
       it('should ignore cache');
       });*/

      describe('if href not found in cache', function () {
        var href = '/tenants/2' + random();
        var data = {
          href: href,
          data: random()};
        var cbSpy = sinon.spy();
        var sandbox, cacheGetSpy, cachePutSpy, reqExecStub;
        before(function () {
          sandbox = sinon.sandbox.create();
          var cache = ds.cacheManager.getCache(region);
          cacheGetSpy = sandbox.spy(cache, 'get');
          cachePutSpy = sandbox.spy(cache, 'put');
          reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
            cb(null, data);
          });

          //act
          ds.getResource(href, {}, InstanceResource, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });
        it('request executor should be called once', function () {
          cacheGetSpy.should.have.been.calledOnce;
          cacheGetSpy.should.have.been.calledWith(href);

          reqExecStub.should.have.been.called;

          cbSpy.should.have.been.calledOnce;
        });
        it('and result should be stored in cache', function () {
          cachePutSpy.should.have.been.calledOnce;
          cachePutSpy.should.have.been.calledWith(href, data);
        });
      });

      describe('if href region not cached', function () {
        var href = '/directory/2' + random();
        var data = {'data': random()};
        var cbSpy = sinon.spy();
        var sandbox, cacheGetSpy, cachePutSpy, reqExecStub;
        before(function () {
          sandbox = sinon.sandbox.create();
          reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
            cb(null, data);
          });

          //act
          ds.getResource(href, {}, InstanceResource, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });
        it('request executor should be called once', function () {
          reqExecStub.should.have.been.called;

          cbSpy.should.have.been.calledOnce;
        });
      });

      describe('request error handling', function () {
        var ds = new DataStore({
          cacheOptions: {
            tenants: {
              store: MemoryStore,
              ttl: 60,
              tti: 60
            }
          },
          apiKey: {id: 1, secret: 2}
        });

        var href = '/tenants/3' + random();
        var cbSpy = sinon.spy();
        var error = new Error();
        var sandbox, reqExecStub;
        before(function () {
          sandbox = sinon.sandbox.create();
          reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
            cb(error);
          });


        });
        after(function () {
          sandbox.restore();
        });
        it('get resource should return error', function () {
          //act
          ds.getResource(href, cbSpy);
          cbSpy.should.have.been.calledWith(error);
        });
        it('create resource should return error', function () {
          //act
          ds.createResource(href, cbSpy);
          cbSpy.should.have.been.calledWith(error);
        });
        it('save resource should return error', function () {
          //act
          ds.saveResource(href, cbSpy);
          cbSpy.should.have.been.calledWith(error);
        });
        it('delete resource should return error', function () {
          //act
          ds.deleteResource({href: href}, cbSpy);
          cbSpy.should.have.been.calledWith(error);
        });
      });

      describe('request undefined state handling', function () {
        var ds = new DataStore({
          cacheOptions: {
            tenants: {
              store: MemoryStore,
              ttl: 60,
              tti: 60
            }
          },
          apiKey: {id: 1, secret: 2}
        });

        var href = '/tenants/3' + random();
        var cbSpy = sinon.spy();
        var sandbox, reqExecStub;
        before(function () {
          sandbox = sinon.sandbox.create();
          reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
            cb(null, null);
          });

          //act
          ds.getResource(href, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });
        it('should not hang if response undefined', function () {
          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWith(null);
        });
      });
    });

    describe('create resource', function () {
      var region = 'tenants';
      var ds = new DataStore({
        cacheOptions: {
          tenants: {
            store: MemoryStore,
            ttl: 60,
            tti: 60
          }
        },
        apiKey: {id: 1, secret: 2}
      });

      var href = '/tenants/3' + random();
      var query = {q: 'all'};
      var data = {'data': random()};
      var response = {
        href: href,
        data: random()
      };
      var cbSpy = sinon.spy();
      var sandbox, cachePutSpy, reqExecStub, requestSpy;
      before(function () {
        sandbox = sinon.sandbox.create();
        var cache = ds.cacheManager.getCache(region);
        cachePutSpy = sandbox.spy(cache, 'put');
        reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
          requestSpy = req;
          cb(null, response);
        });

        //act
        ds.createResource(href, query, data, InstanceResource, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      describe('if provided incorrect resource constructor', function () {
        function callToCreateResourceWithInvalidResouceCtor() {
          ds.createResource(href, query, data, utils.noop, utils.noop);
        }

        it('should throw error', function () {
          callToCreateResourceWithInvalidResouceCtor
            .should.throw(/constructor function.*InstanceResource/i);
        });
      });

      describe('params translation to request object', function () {
        it('should translate href to req.uri', function () {
          requestSpy.uri.should.be.equal(href);
        });
        it('should translate query to req.query', function () {
          requestSpy.query.should.be.equal(query);
        });
        it('should translate body to req.body', function () {
          requestSpy.body.should.be.equal(data);
        });
      });

      describe('after resource creation', function () {
        it('resource should be stored in cache by href in response', function () {
          cachePutSpy.should.have.been.calledOnce;
          //cachePutSpy.should.have.been.calledWith(response.href, response, true, utils.noop);
        });
      });
    });

    describe('save resource', function () {
      var region = 'tenants';
      var ds = new DataStore({
        cacheOptions: {
          tenants: {
            store: MemoryStore,
            ttl: 60,
            tti: 60
          }
        },
        apiKey: {id: 1, secret: 2}
      });

      var href = '/tenants/2' + random();
      var data = {'data': random()};
      var response = {'data': data, href: href};
      var cbSpy = sinon.spy();
      var sandbox, cachePutSpy, reqExecStub, requestSpy;
      before(function () {
        sandbox = sinon.sandbox.create();
        var cache = ds.cacheManager.getCache(region);
        cachePutSpy = sandbox.spy(cache, 'put');
        reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
          requestSpy = req;
          cb(null, response);
        });

        //act
        ds.saveResource(response, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      describe('transfer params in request', function () {
        it('should translate href to req.uri', function () {
          requestSpy.uri.should.be.equal(href);
        });
        it('req.method === POST', function () {
          requestSpy.method.should.be.equal('POST');
        });
        it('should translate body to req.body', function () {
          requestSpy.body.should.be.equal(response);
        });
      });

      describe('after resource update', function () {
        it('should be stored in cache', function () {
          cachePutSpy.should.have.been.calledOnce;
          cachePutSpy.should.have.been.calledWith(response.href, response, false, utils.noop);
        });
      });
    });

    describe('delete resource', function () {
      var region = 'tenants';
      var ds = new DataStore({
        cacheOptions: {
          tenants: {
            store: MemoryStore,
            ttl: 60,
            tti: 60
          }
        },
        apiKey: {id: 1, secret: 2}
      });

      var href = '/tenants/2' + random();
      var data = {'data': random()};
      var response = {'data': data, href: href};
      var cbSpy = sinon.spy();
      var sandbox, cacheDeleteSpy, reqExecStub, requestSpy;
      before(function () {
        sandbox = sinon.sandbox.create();
        var cache = ds.cacheManager.getCache(region);
        cacheDeleteSpy = sandbox.spy(cache, 'delete');
        reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
          requestSpy = req;
          cb(null, response);
        });

        //act
        ds.deleteResource(response, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      it('should remove entry from cache', function () {
        cacheDeleteSpy.should.have.been.calledOnce;
        cacheDeleteSpy.should.have.been.calledWith(href, utils.noop);
      });

      it('href -> req.uri', function () {
        requestSpy.uri.should.be.equal(href);
      });

      it('req.method === DELETE', function () {
        requestSpy.method.should.be.equal('DELETE');
      });
    });
  });
});