var common = require('./common');
var _ = common._;
var sinon = common.sinon;
var should = common.should;

var Tenant = require('../lib/resource/Tenant');
var Resource = require('../lib/resource/Resource');
var InstanceResource = require('../lib/resource/InstanceResource');
var CollectionResource = require('../lib/resource/CollectionResource');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  var apiKey = {id: 1, secret: 2};
  describe('CollectionResource class', function () {
    describe('constructor: ', function () {
      /*data, dataStore, query, InstanceCtor*/
      describe('if data not provided:', function () {
        var cr;
        before(function () {
          cr = new CollectionResource();
        });
        it('data field should not be exposed', function () {
          should.not.exist(cr.data);
        });
      });

      describe('if provided data don`t have items:', function () {
        var cr;
        var data = {};

        function createCollectionResource() {
          cr = new CollectionResource(data);
        }

        it('should not throw exception', function () {
          createCollectionResource.should.not.throw();
        });
        it('data items should be undefined', function () {
          createCollectionResource();
          should.not.exist(data.items);
        });
      });

      describe('if provided data has items:', function () {
        describe('if items is a raw json', function () {
          var data = {items: [
            {href: ''},
            {href: ''}
          ]};
          var cr;
          before(function () {
            cr = new CollectionResource(data);
          });

          it('they should be converted', function () {
            _.each(data.items, function (item) {
              item.should.be.an.instanceof(Resource);
            });
          });
        });

        describe('if items already converted', function () {
          var ds = new DataStore({apiKey: apiKey});
          var data = {items: [
            new Tenant({href: ''}, ds),
            new Tenant({href: ''}, ds)
          ]};
          var cr;
          before(function () {
            cr = new CollectionResource(data);
          });

          it('they should not be converted', function () {
            _.each(data.items, function (item) {
              item.should.be.an.instanceof(Tenant);
            });
          });
        });
      });

      describe('if query not provided:', function () {
        var cr;
        before(function () {
          cr = new CollectionResource();
        });
        it('query field should be undefined', function () {
          should.not.exist(cr.query);
        });
      });

      describe('if query provided:', function () {
        var cr;
        var data = {}, query = {};
        before(function () {
          cr = new CollectionResource(data, query);
        });
        it('query field should be undefined', function () {
          cr.query.should.be.equal(query);
        });
      });

      describe('if InstanceCtor not provided:', function () {
        var cr;
        before(function () {
          cr = new CollectionResource();
        });
        it('instance constructor should be InstanceResource by default', function () {
          cr.instanceConstructor.should.be.equal(InstanceResource);
        });
      });

      describe('if InstanceCtor provided:', function () {
        var cr;
        before(function () {
          cr = new CollectionResource(null, null, Tenant, null);
        });
        it('instance constructor should be undefined', function () {
          cr.instanceConstructor.should.be.equal(Tenant);
        });
      });
    });

    describe('call to each method', function () {
      describe('with no items', function () {
        var cr, cbSpy;
        before(function () {
          cr = new CollectionResource();
          cbSpy = sinon.spy();

          cr.each(cbSpy);
        });

        it('should not call callback', function () {
          /* jshint -W030 */
          cbSpy.should.not.have.been.called;
        });
      });

      describe('with empty items', function () {
        var cr, cbSpy;
        before(function () {
          cr = new CollectionResource({});
          cbSpy = sinon.spy();

          cr.each(cbSpy);
        });

        it('should not call callback', function(){
          /* jshint -W030 */
          cbSpy.should.not.have.been.called;
        });
      });

      describe('with items list', function () {
        var cr, cbSpy;
        var ds = new DataStore({apiKey: apiKey});
        var data = {
          offset: 0,
          items:[
          new Tenant({href:''}, ds),
          new Tenant({href:''}, ds)
        ]};

        before(function () {
          cr = new CollectionResource(data, null, Tenant, null);
          cbSpy = sinon.spy();

          cr.each(cbSpy);
        });

        it('should call callback for each item', function(){
          /* jshint -W030 */
          cbSpy.should.have.been.calledTwice;
        });

        it('should increase offset counter', function(){
          _.each(data.items, function(item, index){
            var spyCall = cbSpy.getCall(index);
            spyCall.should.have.been.calledWith(null, item, index);
          });
        });
      });

      describe('when all items in current page are processed', function () {
        var sandbox;
        var cr, cbSpy, getResourceStub;
        var ds = new DataStore({apiKey: apiKey});
        var query = {q: 'boom!'};
        var data = {
          href: 'test_href',
          query: query,
          offset: 0,
          limit: 2,
          items:[
            new Tenant({href:''}, ds),
            new Tenant({href:''}, ds)
          ]};

        var nextQuery = {
          q: query.q,
          offset: 2,
          limit: 2
        };
        var data2 = {
          query: query,
          offset: 2,
          limit: 2,
          items:[
            new Tenant({href:''}, ds),
            new Tenant({href:''}, ds)
          ]};

        before(function () {
          sandbox = sinon.sandbox.create();

          getResourceStub = sandbox.stub(ds, 'getResource',
            function onGetResource(href, nextQuery, ctor, cb){
              if (nextQuery.offset === 4){
                return cb(null, {});
              }
              cb(null, data2);
          });

          cr = new CollectionResource(data, query, Tenant, ds);
          cbSpy = sinon.spy();

          cr.each(cbSpy);
        });

        after(function(){
          sandbox.restore();
        });
        it('should request next page', function(){
          cbSpy.callCount.should.be.equal(4);
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          /* jshint +W030 */
          getResourceStub.getCall(0)
            .should.have.been.calledWith(data.href, nextQuery, Tenant);
        });
      });
    });
  });
});