var common = require('./common');
var sinon = common.sinon;
var nock = common.nock;
var u = common.u;

var Resource = require('../lib/resource/Resource');
var InstanceResource = require('../lib/resource/InstanceResource');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('InstanceResource class', function(){

    var ds = new DataStore({apiKey:{id:1,secret:2}});
    var app = {href: '/href'};
    var instanceResource = new InstanceResource({
      applications: app,
      directory: {}
    }, ds);

    describe('call to get resource', function(){
      describe('without property name', function(){
        var sandbox, error, cb, getResourceSpy;
        before(function(){
          cb = function(err){error = err;};
          sandbox = sinon.sandbox.create();
          getResourceSpy = sandbox.spy(ds, 'getResource');

          instanceResource.get(cb);
        });
        after(function(){
          sandbox.restore();
        });

        it('should return error', function(){
          /* jshint -W030 */
          getResourceSpy.should.not.have.been.called;
          /* jshint +W030 */
          error.should.be.an.instanceof(Error);
          error.message.should.match(/There is no field named/i);
        });
      });

      describe('with property name to not reference field', function(){
        var sandbox, error, cb, getResourceSpy;
        before(function(){
          cb = function(err){error = err;};
          sandbox = sinon.sandbox.create();
          getResourceSpy = sandbox.spy(ds, 'getResource');

          instanceResource.get('directory', cb);
        });
        after(function(){
          sandbox.restore();
        });

        it('should return error', function(){
          /* jshint -W030 */
          getResourceSpy.should.not.have.been.called;
          /* jshint +W030 */
          error.should.be.an.instanceof(Error);
          error.message.should.match(/is not a reference property/i);
          error.message.should.match(/directory/i);
        });
      });

      describe('without optional query param', function(){
        var sandbox, error, cb, getResourceSpy;
        before(function(){
          cb = function(err){error = err;};
          sandbox = sinon.sandbox.create();
          getResourceSpy = sandbox.spy(ds, 'getResource');
          nock(u.BASE_URL).get(u.v1(app.href)).reply(200, {});

          instanceResource.get('applications', cb);
        });
        after(function(){
          sandbox.restore();
        });
        it('should delegate call to data store get resource', function(){
          /* jshint -W030 */
          getResourceSpy.should.have.been.calledOnce;
        });
        it('should assign null to query', function(){
          getResourceSpy.should.have.been
            .calledWith(app.href, null, null, cb);
        });
      });

      describe('without optional query param but with ctor', function(){
        var sandbox, error, cb, ctor, getResourceSpy;
        before(function(){
          cb = function(err){error = err;};
          ctor = Resource;
          sandbox = sinon.sandbox.create();
          getResourceSpy = sandbox.spy(ds, 'getResource');
          nock(u.BASE_URL).get(u.v1(app.href)).reply(200, app);

          instanceResource.get('applications', ctor, cb);
        });
        after(function(){
          sandbox.restore();
        });
        it('should assign null to query', function(){
          getResourceSpy.should.have.been
            .calledWith(app.href, null, ctor, cb);
        });
        it('should call get resource with ctor param', function(){
          getResourceSpy.should.have.been
            .calledWith(app.href, null, ctor, cb);
        });
      });

      describe('with optional query param', function(){
        var query = {q:'asd'};
        var sandbox, error, cb, getResourceSpy;
        before(function(){
          cb = function(err){error = err;};
          sandbox = sinon.sandbox.create();
          getResourceSpy = sandbox.spy(ds, 'getResource');
          nock(u.BASE_URL).get(u.v1(app.href) + '?q='+query.q).reply(200, app);

          instanceResource.get('applications', query, cb);
        });
        after(function(){
          sandbox.restore();
        });
        it('should call get resource with query param', function(){
          getResourceSpy.should.have.been
            .calledWith(app.href, query, null, cb);
        });
      });

      describe('with optional query and ctor param', function(){
        var sandbox, error, cb, query, ctor, getResourceSpy;
        before(function(){
          cb = function(err){error = err;};
          ctor = Resource;
          query = {q:'boom!'};
          sandbox = sinon.sandbox.create();
          getResourceSpy = sandbox.spy(ds, 'getResource');
          nock(u.BASE_URL).get(u.v1(app.href) + '?q='+query.q).reply(200, app);

          instanceResource.get('applications', query, ctor, cb);
        });
        after(function(){
          sandbox.restore();
        });

        it('should delegate call to data store get resource', function(){
          getResourceSpy.should.have.been
            .calledWith(app.href, query, ctor, cb);
        });
      });
    });

    describe('call to save resource', function(){
      var sandbox, cb,  saveResourceSpy;
      before(function(){
        cb = function(){};
        sandbox = sinon.sandbox.create();
        saveResourceSpy = sandbox.stub(ds, 'saveResource');

        instanceResource.save(cb);
      });
      after(function(){
        sandbox.restore();
      });

      it('should delegate call to data store save', function(){
        /* jshint -W030 */
        saveResourceSpy.should.have.been.calledOnce;
        /* jshint +W030 */
        saveResourceSpy.should.have.been.calledWith(instanceResource, cb);
      });
    });

    describe('call to delete resource', function(){
      var sandbox, cb,  deleteResourceSpy;
      before(function(){
        cb = function(){};
        sandbox = sinon.sandbox.create();
        deleteResourceSpy = sandbox.stub(ds, 'deleteResource');

        instanceResource.delete(cb);
      });
      after(function(){
        sandbox.restore();
      });
      it('should delegate call to data store delete', function(){
        /* jshint -W030 */
        deleteResourceSpy.should.have.been.calledOnce;
        /* jshint +W030 */
        deleteResourceSpy.should.have.been.calledWith(instanceResource, cb);
      });
    });
  });
});