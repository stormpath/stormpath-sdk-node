var common = require('./common');

var u = common.u;
var nock = common.nock;
var sinon = common.sinon;
var assert = common.assert;

var Resource = require('../lib/resource/Resource');
var InstanceResource = require('../lib/resource/InstanceResource');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('InstanceResource class', function(){
    var ds;
    var app;
    var instanceResource;

    before(function () {
      ds = new DataStore({client: {apiKey:{id: 1,secret: 2}}});
      app = {href: '/href'};

      instanceResource = new InstanceResource({
        applications: app,
        directory: {}
      }, ds);
    });

    describe('call to get()', function(){
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
        var query;
        var sandbox, error, cb, getResourceSpy;

        before(function(){
          query = {q: 'asd'};
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

    describe('call to save()', function(){
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

      describe('with custom data', function () {
        var hasReservedFieldsSpy;
        var hasRemovedPropertiesSpy;
        var deleteReservedFieldsSpy;
        var deleteRemovedPropertiesSpy;

        before(function () {
          var customDataMock = {
            _hasReservedFields: function () {},
            _hasRemovedProperties: function () {},
            _deleteReservedFields: function () {},
            _deleteRemovedProperties: function () {}
          };

          hasReservedFieldsSpy = sandbox.stub(customDataMock, '_hasReservedFields').returns(true);
          hasRemovedPropertiesSpy = sandbox.stub(customDataMock, '_hasRemovedProperties').returns(true);
          deleteReservedFieldsSpy = sandbox.stub(customDataMock, '_deleteReservedFields').returns(customDataMock);
          deleteRemovedPropertiesSpy = sandbox.stub(customDataMock, '_deleteRemovedProperties');

          instanceResource.customData = customDataMock;
          instanceResource.save();
        });

        after(function () {
          delete instanceResource['customData'];
          sandbox.restore();
        });

        it('should call customData._hasReservedFields()', function () {
          /* jshint -W030 */
          hasReservedFieldsSpy.should.have.been.calledOnce;
          /* jshint +W030 */
        });

        it('should call customData._deleteReservedFields()', function () {
          /* jshint -W030 */
          hasReservedFieldsSpy.should.have.been.calledOnce;
          /* jshint +W030 */
        });

        it('should call customData._hasRemovedProperties()', function () {
          /* jshint -W030 */
          hasRemovedPropertiesSpy.should.have.been.calledOnce;
          /* jshint +W030 */
        });

        it('should call customData._deleteRemovedProperties()', function () {
          /* jshint -W030 */
          deleteRemovedPropertiesSpy.should.have.been.calledOnce;
          /* jshint +W030 */
        });
      });
    });

    describe('call to delete()', function(){
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

    describe('call to invalidate()', function () {
      var sandbox, evictStub, evictedKeys;

      before(function (done) {
        evictedKeys = [];
        sandbox = sinon.sandbox.create();

        evictStub = sandbox.stub(ds, '_evict', function (key, callback) {
          evictedKeys.push(key);
          callback();
        });

        instanceResource.href = '32a0c55b-9fad-4aeb-8187-1149b4f980ce';
        instanceResource.customData = {
          href: instanceResource.href + '/ceb8c607-78ca-4cc0-872a-098e895ec1a5'
        };

        instanceResource.invalidate(done);
      });

      after(function () {
        delete instanceResource['href'];
        delete instanceResource['customData'];
        sandbox.restore();
      });

      it('should invalidate the account and all of its child resources', function (done) {
        assert.equal(evictedKeys.length, 2);
        assert.equal(evictedKeys[0], instanceResource.href);
        assert.equal(evictedKeys[1], instanceResource.customData.href);
        done();
      });
    });
  });
});
