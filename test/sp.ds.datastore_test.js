var common = require('./common');
var sinon = common.sinon;
var utils = require('../lib/utils');

var DataStore = require('../lib/ds/DataStore');
var RequestExecutor = require('../lib/ds/RequestExecutor');
var MemoryStore = require('../lib/cache/MemoryStore');
var InstanceResource = require('../lib/resource/InstanceResource');

function random() {
  return Math.floor(Math.random() * Date.now());
}

describe('ds:', function () {
  describe('DataStore:', function () {

    describe('when constructed', function () {
      describe('and request executor not provided in config', function () {
        var ds = new DataStore({apiKey: {id: 1, secret: 2}});
        it('should create instance of default RequestExecutor', function () {
          ds.requestExecutor.should.be.an.instanceof(RequestExecutor);
        });
      });

      describe('and request executor was provided in config', function () {
        var reqExec = new RequestExecutor({apiKey: {id: 1, secret: 2}});
        var ds = new DataStore({requestExecutor: reqExec});
        it('should reuse provided request executor instance', function () {
          ds.requestExecutor.should.be.equal(reqExec);
        });
      });

      describe('if config not provided', function () {
        function createDataStoreWithoutConfig() {
          return new DataStore();
        }

        it('should throw "config argument is required"', function () {
          createDataStoreWithoutConfig.should
            .throw(/config argument is required/i);
        });
      });
    });

    describe('getResource()', function () {
      var ds = new DataStore({
        cacheOptions: { store: 'memory' },
        apiKey: {id: 1, secret: 2}
      });

      describe('without required params', function () {
        it('should throw error if href is not defined', function () {
          ds.getResource.should.throw();
        });

        it('should throw error if callback is not defined', function () {
          ds.getResource.should.throw();
        });
      });

      describe('when resource is already cached', function () {

        var resource = {
          href: '/tenants/' + common.uuid(),
          data: common.uuid()
        };
        var cbSpy = sinon.spy();
        var sandbox, cacheGetSpy, reqExecSpy;
        before(function (done) {
          sandbox = sinon.sandbox.create();
          reqExecSpy = sandbox.spy(ds.requestExecutor, 'execute');
          var cache = ds.cacheHandler.cacheManager.getCache('tenants');
          cacheGetSpy = sandbox.spy(cache, 'get');
          cache.put(resource.href, resource, true, done);
        });
        after(function () {
          sandbox.restore();
        });

        it('should call the cache and not the resource executor', function () {
          ds.getResource(resource.href, cbSpy);
          /* jshint -W030 */
          cacheGetSpy.should.have.been.calledOnce;
          cacheGetSpy.should.have.been.calledWith(resource.href);

          reqExecSpy.should.not.been.called;

          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWith(null);
        });
      });

      // todo: tbd - ignore cache if query param provided
      /*      describe('if query provided', function(){
       it('should ignore cache');
       });*/

      describe('when resource is not in cache', function () {
        var resource = {
          href: '/tenants/' + common.uuid(),
          data: common.uuid()
        };
        var cbSpy = sinon.spy();
        var sandbox, cacheGetSpy, cachePutSpy, reqExecStub;
        before(function () {
          sandbox = sinon.sandbox.create();
          var cache = ds.cacheHandler.cacheManager.getCache('tenants');
          cacheGetSpy = sandbox.spy(cache, 'get');
          cachePutSpy = sandbox.spy(cache, 'put');
          reqExecStub = sandbox.stub(ds.requestExecutor, 'execute', function (req, cb) {
            cb(null, resource);
          });

          //act
          ds.getResource(resource.href, {}, InstanceResource, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });
        it('request executor should be called once', function () {
          /* jshint -W030 */
          cacheGetSpy.should.have.been.calledOnce;
          cacheGetSpy.should.have.been.calledWith(resource.href);

          reqExecStub.should.have.been.called;

          cbSpy.should.have.been.calledOnce;
        });
        it('and result should be stored in cache', function () {
          /* jshint -W030 */
          cachePutSpy.should.have.been.calledOnce;
          cachePutSpy.should.have.been.calledWith(resource.href, resource);
        });
      });

      describe('if href not cached', function () {
        var href = '/directory/2' + random();
        var data = {'data': random()};
        var cbSpy = sinon.spy();
        var sandbox, reqExecStub;
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
          /* jshint -W030 */
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
          /* jshint -W030 */
          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWith(null);
        });
      });
    });

    describe('createResource:', function () {
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
        var cache = ds.cacheHandler.cacheManager.getCache('tenants');
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
          /* jshint -W030 */
          cachePutSpy.should.have.been.calledOnce;
        });
      });
    });

    describe('save resource', function () {
      var ds = new DataStore({
        cacheOptions: {
          store: 'memory',
          ttl: 60,
          tti: 60
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
        var cache = ds.cacheHandler.cacheManager.getCache('tenants');
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
          /* jshint -W030 */
          cachePutSpy.should.have.been.calledOnce;
          cachePutSpy.should.have.been.calledWith(response.href,response,false);
        });
      });
    });

    describe('delete resource', function () {
      var ds = new DataStore({
        cacheOptions: {
          store: MemoryStore,
          ttl: 60,
          tti: 60
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
        var cache = ds.cacheHandler.cacheManager.getCache('tenants');
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
        /* jshint -W030 */
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