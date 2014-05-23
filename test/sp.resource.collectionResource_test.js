/* jshint -W030 */
var common = require('./common');
var _ = common._;
var u = common.u;
var nock = common.nock;
var sinon = common.sinon;
var should = common.should;

var async = require('async');
var querystring = require('querystring');

var Tenant = require('../lib/resource/Tenant');
var Resource = require('../lib/resource/Resource');
var Application = require('../lib/resource/Application');
var InstanceResource = require('../lib/resource/InstanceResource');
var CollectionResource = require('../lib/resource/CollectionResource');
var instantiate = require('../lib/resource/ResourceFactory').instantiate;
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  "use strict";
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
      function iterator(){Array.prototype.slice.call(arguments).pop()();}

      describe('with no items', function () {
        var cr, iteratorSpy, cbSpy;
        before(function () {
          cr = new CollectionResource();
          iteratorSpy = sinon.spy(iterator);
          cbSpy = sinon.spy();

          cr.each(iteratorSpy, cbSpy);
        });

        it('should not call callback', function () {
          /* jshint -W030 */
          iteratorSpy.should.not.have.been.called;
          cbSpy.should.have.been.calledOnce;
        });
      });

      describe('with empty items', function () {
        var cr, iteratorSpy, cbSpy;
        before(function () {
          cr = new CollectionResource({});
          iteratorSpy = sinon.spy();
          cbSpy = sinon.spy();

          cr.each(iteratorSpy, cbSpy);
        });

        it('should not call callback', function(){
          /* jshint -W030 */
          iteratorSpy.should.not.have.been.called;
          cbSpy.should.have.been.calledOnce;
        });
      });

      describe('with items list', function () {
        var cr, sandbox, iteratorSpy, cbSpy, getResourceStub;
        var ds = new DataStore({apiKey: apiKey});
        var data = {
          offset: 0,
          items:[
          new Tenant({href:''}, ds),
          new Tenant({href:''}, ds)
        ]};

        before(function () {
          cr = new CollectionResource(data, null, Tenant, ds);
          sandbox = sinon.sandbox.create();
          iteratorSpy = sandbox.spy(iterator);
          cbSpy = sandbox.spy();
          getResourceStub = sandbox.stub(ds, 'getResource',
            function onGetResource(href, nextQuery, ctor, cb){
              cb(null, {});
            });
          cr.each(iteratorSpy, cbSpy);
        });

        after(function(){
          sandbox.restore();
        });

        it('should call callback for each item', function(){
          /* jshint -W030 */
          iteratorSpy.should.have.been.calledTwice;
          cbSpy.should.have.been.calledOnce;
        });

        it('should increase offset counter', function(){
          _.each(data.items, function(item, index){
            var spyCall = iteratorSpy.getCall(index);
            spyCall.args[spyCall.args.length -1].should.be.a('function');
            spyCall.should.have.been.calledWith(item);
          });
        });
      });

      describe('when all items in current page are processed', function () {
        var sandbox;
        var cr, iteratorSpy, getResourceStub;
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
          limit: 100
        };
        var data2 = {
          query: query,
          offset: 2,
          limit: 2,
          items:[
            new Tenant({href:''}, ds),
            new Tenant({href:''}, ds)
          ]};

        before(function (done) {
          sandbox = sinon.sandbox.create();

          getResourceStub = sandbox.stub(ds, 'getResource',
            function onGetResource(href, nextQuery, ctor, cb){
              if (nextQuery.offset > 2){
                return cb(null, null);
              }
              cb(null, new CollectionResource(data2, query, Tenant, ds));
          });

          cr = new CollectionResource(data, query, Tenant, ds);
          iteratorSpy = sandbox.spy(iterator);

          cr.each(iteratorSpy, done);
        });

        after(function(){
          sandbox.restore();
        });

        it('should request next page', function(){
          iteratorSpy.callCount.should.be.equal(4);
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          /* jshint +W030 */
          getResourceStub.getCall(0)
            .should.have.been.calledWith(data.href, nextQuery, Tenant);
        });
      });
    });

    describe('async methods with pagination', function(){
      var ds = new DataStore({apiKey: {id:1, secret: 2}});

      function test(method){
        return function(){
          var n = 250;
          function createAppsCollection(items, offset, limit){
            return {
              href: '/tenants/78KBoSJ5EkMD8OVmBV934Y/applications',
              offset: offset,
              limit: limit,
              items: items.slice(offset, offset+limit)
            };
          }

          function application(i){
            return { href: '/applications/' + i,
              name: 'testing ' + i,
              description: i,
              status: 'ENABLED'
            };
          }

          function createNApps(n){
            var items = [];
            for (var i = 0; i < n; i++){
              items.push(application(i));
            }
            return items;
          }

          var i, items, pages = [], applications;
          var sandbox, iteratorSpy, callbackSpy, asyncIteratorSpy, asyncCallbackSpy;

          before(function(done){
            // set up:
            // 1. items
            items = createNApps(n);
            // 2. create app collection resource
            for (i = 0; i < Math.ceil(n/100); i++){
              pages.push(createAppsCollection(items, i*100, (i+1)*100));
            }
            applications = instantiate(Application, pages[0], {}, ds);
            // 3. nock
            nock(u.BASE_URL).get(u.v1(applications.href)).reply(200,pages);
            for (i = 1; i < Math.ceil(n/100); i++) {
              var ref = u.v1(applications.href) + '?' + querystring.stringify({offset: i * 100, limit: 100});
              nock(u.BASE_URL).get(ref).reply(200, pages[i]);
            }
            sandbox = sinon.sandbox.create();
            // 4. iterator and callback spies
            function iterator(item, cb){
              cb();
            }
            iteratorSpy = sandbox.spy(iterator);
            asyncIteratorSpy = sandbox.spy(iterator);

            async.series([
              function(cb){
                function callback(err){
                  cb(err);
                }
                callbackSpy = sandbox.spy(callback);
                applications[method](iteratorSpy, callbackSpy);
              },
              function(cb){
                function callback(err){
                  cb(err);
                }
                asyncCallbackSpy = sandbox.spy(callback);
                async[method](items, asyncIteratorSpy, asyncCallbackSpy);
              }
            ], done);
          });

          after(function(){
            sandbox.restore();
          });

          it('should call iterators with same arguments', function(){
            for (var i = 0; i < n; i++){
              var asyncArgs = asyncIteratorSpy.getCall(i).args;
              var args = iteratorSpy.getCall(i).args;
              asyncArgs[0].should.be.deep.equal(_.pick(args[0], 'href', 'name', 'description', 'status'));
            }
          });

          it('should call iterator n times', function(){
            iteratorSpy.should.have.been.calledBefore(callbackSpy);
            iteratorSpy.callCount.should.be.equal(n);
          });

          it('should call callback once', function(){
            callbackSpy.should.have.been.calledOnce;
          });
        };
      }

      function testLimit(method){
        return function(){
          var n = 250;
          function createAppsCollection(items, offset, limit){
            return {
              href: '/tenants/78KBoSJ5EkMD8OVmBV934Y/applications',
              offset: offset,
              limit: limit,
              items: items.slice(offset, offset+limit)
            };
          }

          function application(i){
            return { href: '/applications/' + i,
              name: 'testing ' + i,
              description: i,
              status: 'ENABLED'
            };
          }

          function createNApps(n){
            var items = [];
            for (var i = 0; i < n; i++){
              items.push(application(i));
            }
            return items;
          }

          var i, items, pages = [], applications;
          var sandbox, iteratorSpy, callbackSpy, asyncIteratorSpy, asyncCallbackSpy;

          before(function(done){
            // set up:
            // 1. items
            items = createNApps(n);
            // 2. create app collection resource
            for (i = 0; i < Math.ceil(n/100); i++){
              pages.push(createAppsCollection(items, i*100, (i+1)*100));
            }
            applications = instantiate(Application, pages[0], {}, ds);
            // 3. nock
            nock(u.BASE_URL).get(u.v1(applications.href)).reply(200,pages);
            for (i = 1; i < Math.ceil(n/100); i++) {
              var ref = u.v1(applications.href) + '?' + querystring.stringify({offset: i * 100, limit: 100});
              nock(u.BASE_URL).get(ref).reply(200, pages[i]);
            }
            sandbox = sinon.sandbox.create();
            // 4. iterator and callback spies
            function iterator(item, cb){
              cb();
            }
            iteratorSpy = sandbox.spy(iterator);
            asyncIteratorSpy = sandbox.spy(iterator);

            async.series([
              function(cb){
                function callback(err){
                  cb(err);
                }
                callbackSpy = sandbox.spy(callback);
                applications[method](10, iteratorSpy, callbackSpy);
              },
              function(cb){
                function callback(err){
                  cb(err);
                }
                asyncCallbackSpy = sandbox.spy(callback);
                async[method](items, 10, asyncIteratorSpy, asyncCallbackSpy);
              }
            ], done);
          });

          after(function(){
            sandbox.restore();
          });

          it('should call iterators with same arguments', function(){
            for (var i = 0; i < n; i++){
              var asyncArgs = asyncIteratorSpy.getCall(i).args;
              var args = iteratorSpy.getCall(i).args;
              asyncArgs[0].should.be.deep.equal(_.pick(args[0], 'href', 'name', 'description', 'status'));
            }
          });

          it('should call iterator n times', function(){
            iteratorSpy.should.have.been.calledBefore(callbackSpy);
            iteratorSpy.callCount.should.be.equal(n);
          });

          it('should call callback once', function(){
            callbackSpy.should.have.been.calledOnce;
          });
        };
      }

      function testBoolean(method, shouldBeCalledCount){
        return function(){
          var n = 250;
          shouldBeCalledCount = shouldBeCalledCount || n;
          function createAppsCollection(items, offset, limit){
            return {
              href: '/tenants/78KBoSJ5EkMD8OVmBV934Y/applications',
              offset: offset,
              limit: limit,
              items: items.slice(offset, offset+limit)
            };
          }

          function application(i){
            return { href: '/applications/' + i,
              name: 'testing ' + i,
              description: i,
              status: 'ENABLED'
            };
          }

          function createNApps(n){
            var items = [];
            for (var i = 0; i < n; i++){
              items.push(application(i));
            }
            return items;
          }

          var i, items, pages = [], applications;
          var sandbox, iteratorSpy, callbackSpy, asyncIteratorSpy, asyncCallbackSpy;

          before(function(done){
            // set up:
            // 1. items
            items = createNApps(n);
            // 2. create app collection resource
            for (i = 0; i < Math.ceil(n/100); i++){
              pages.push(createAppsCollection(items, i*100, (i+1)*100));
            }
            applications = instantiate(Application, pages[0], {}, ds);
            // 3. nock
            nock(u.BASE_URL).get(u.v1(applications.href)).reply(200,pages);
            for (i = 1; i < Math.ceil(n/100); i++) {
              var ref = u.v1(applications.href) + '?' + querystring.stringify({offset: i * 100, limit: 100});
              nock(u.BASE_URL).get(ref).reply(200, pages[i]);
            }
            sandbox = sinon.sandbox.create();
            // 4. iterator and callback spies
            function iterator(item, cb){
              cb(item.description % 2 === 0);
            }
            iteratorSpy = sandbox.spy(iterator);
            asyncIteratorSpy = sandbox.spy(iterator);

            async.series([
              function(cb){
                function callback(){
                  cb();
                }
                callbackSpy = sandbox.spy(callback);
                applications[method](iteratorSpy, callbackSpy);
              },
              function(cb){
                function callback(){
                  cb();
                }
                asyncCallbackSpy = sandbox.spy(callback);
                async[method](items, asyncIteratorSpy, asyncCallbackSpy);
              }
            ], done);
          });

          after(function(){
            sandbox.restore();
          });

          it('should call iterators with same arguments', function(){
            for (var i = 0; i < shouldBeCalledCount; i++){
              var asyncArgs = asyncIteratorSpy.getCall(i).args;
              var args = iteratorSpy.getCall(i).args;
              asyncArgs[0].should.be.deep.equal(_.pick(args[0], 'href', 'name', 'description', 'status'));
            }
          });

          it('should call iterator '+ shouldBeCalledCount +' times', function(){
            iteratorSpy.should.have.been.calledBefore(callbackSpy);
            iteratorSpy.callCount.should.be.equal(shouldBeCalledCount);
          });

          it('should call callback once', function(){
            callbackSpy.should.have.been.calledOnce;
            var asyncArgs = asyncCallbackSpy.getCall(0).args[0];
            var args = callbackSpy.getCall(0).args[0];
            if (asyncArgs !== true && asyncArgs !== false){
              args = _.pick(callbackSpy.getCall(0).args[0], 'href', 'name', 'description', 'status');
            }

            args.should.be.deep.equal(asyncArgs);
          });
        };
      }

      function testCheck(method){
        return function(){
          var n = 250;
          function createAppsCollection(items, offset, limit){
            return {
              href: '/tenants/78KBoSJ5EkMD8OVmBV934Y/applications',
              offset: offset,
              limit: limit,
              items: items.slice(offset, offset+limit)
            };
          }

          function application(i){
            return { href: '/applications/' + i,
              name: 'testing ' + i,
              description: i,
              status: 'ENABLED'
            };
          }

          function createNApps(n){
            var items = [];
            for (var i = 0; i < n; i++){
              items.push(application(i));
            }
            return items;
          }

          var i, items, pages = [], applications;
          var sandbox, iteratorSpy, callbackSpy, asyncIteratorSpy, asyncCallbackSpy;

          before(function(done){
            // set up:
            // 1. items
            items = createNApps(n);
            // 2. create app collection resource
            for (i = 0; i < Math.ceil(n/100); i++){
              pages.push(createAppsCollection(items, i*100, (i+1)*100));
            }
            applications = instantiate(Application, pages[0], {}, ds);
            // 3. nock
            nock(u.BASE_URL).get(u.v1(applications.href)).reply(200,pages);
            for (i = 1; i < Math.ceil(n/100); i++) {
              var ref = u.v1(applications.href) + '?' + querystring.stringify({offset: i * 100, limit: 100});
              nock(u.BASE_URL).get(ref).reply(200, pages[i]);
            }
            sandbox = sinon.sandbox.create();
            // 4. iterator and callback spies
            function iterator(item, cb){
              cb(item.description % 2 === 0);
            }
            iteratorSpy = sandbox.spy(iterator);
            asyncIteratorSpy = sandbox.spy(iterator);

            async.series([
              function(cb){
                function callback(){
                  cb();
                }
                callbackSpy = sandbox.spy(callback);
                applications[method](iteratorSpy, callbackSpy);
              },
              function(cb){
                function callback(){
                  cb();
                }
                asyncCallbackSpy = sandbox.spy(callback);
                async[method](items, asyncIteratorSpy, asyncCallbackSpy);
              }
            ], done);
          });

          after(function(){
            sandbox.restore();
          });

          it('should call iterators with same arguments', function(){
            for (var i = 0; i < n; i++){
              var asyncArgs = asyncIteratorSpy.getCall(i).args;
              var args = iteratorSpy.getCall(i).args;
              asyncArgs[0].should.be.deep.equal(_.pick(args[0], 'href', 'name', 'description', 'status'));
            }
          });

          it('should call iterator n times', function(){
            iteratorSpy.should.have.been.calledBefore(callbackSpy);
            iteratorSpy.callCount.should.be.equal(n);
          });

          it('should call callback once', function(){
            callbackSpy.should.have.been.calledOnce;
            var args = _.map(callbackSpy.getCall(0).args[0],
              function(item) {
                return _.pick(item, 'href', 'name', 'description', 'status');
              });
            var asyncArgs = asyncCallbackSpy.getCall(0).args[0];
            args.should.be.deep.equal(asyncArgs);
          });
        };
      }

      function testSortBy(method){
        return function(){
          var n = 250;
          function createAppsCollection(items, offset, limit){
            return {
              href: '/tenants/78KBoSJ5EkMD8OVmBV934Y/applications',
              offset: offset,
              limit: limit,
              items: items.slice(offset, offset+limit)
            };
          }

          function application(i){
            return { href: '/applications/' + i,
              name: 'testing ' + i,
              description: i,
              status: 'ENABLED'
            };
          }

          function createNApps(n){
            var items = [];
            for (var i = 0; i < n; i++){
              items.push(application(i));
            }
            return items;
          }

          var i, items, pages = [], applications;
          var sandbox, iteratorSpy, callbackSpy, asyncIteratorSpy, asyncCallbackSpy;

          before(function(done){
            // set up:
            // 1. items
            items = createNApps(n);
            // 2. create app collection resource
            for (i = 0; i < Math.ceil(n/100); i++){
              pages.push(createAppsCollection(items, i*100, (i+1)*100));
            }
            applications = instantiate(Application, pages[0], {}, ds);
            // 3. nock
            nock(u.BASE_URL).get(u.v1(applications.href)).reply(200,pages);
            for (i = 1; i < Math.ceil(n/100); i++) {
              var ref = u.v1(applications.href) + '?' + querystring.stringify({offset: i * 100, limit: 100});
              nock(u.BASE_URL).get(ref).reply(200, pages[i]);
            }
            sandbox = sinon.sandbox.create();
            // 4. iterator and callback spies
            function iterator(item, cb){
              cb(null, item.description % 2 === 0);
            }
            iteratorSpy = sandbox.spy(iterator);
            asyncIteratorSpy = sandbox.spy(iterator);

            async.series([
              function(cb){
                function callback(){
                  cb();
                }
                callbackSpy = sandbox.spy(callback);
                applications[method](iteratorSpy, callbackSpy);
              },
              function(cb){
                function callback(){
                  cb();
                }
                asyncCallbackSpy = sandbox.spy(callback);
                async[method](items, asyncIteratorSpy, asyncCallbackSpy);
              }
            ], done);
          });

          after(function(){
            sandbox.restore();
          });

          it('should call iterators with same arguments', function(){
            for (var i = 0; i < n; i++){
              var asyncArgs = asyncIteratorSpy.getCall(i).args;
              var args = iteratorSpy.getCall(i).args;
              asyncArgs[0].should.be.deep.equal(_.pick(args[0], 'href', 'name', 'description', 'status'));
            }
          });

          it('should call iterator n times', function(){
            iteratorSpy.should.have.been.calledBefore(callbackSpy);
            iteratorSpy.callCount.should.be.equal(n);
          });

          it('should call callback once', function(){
            callbackSpy.should.have.been.calledOnce;
            var args = _.map(callbackSpy.getCall(0).args[1],
              function(item) {
                return _.pick(item, 'href', 'name', 'description', 'status');
              });
            var asyncArgs = asyncCallbackSpy.getCall(0).args[1];
            args.should.be.deep.equal(asyncArgs);
          });
        };
      }

      function testReduce(method){
        return function(){
          var n = 250;
          function createAppsCollection(items, offset, limit){
            return {
              href: '/tenants/78KBoSJ5EkMD8OVmBV934Y/applications',
              offset: offset,
              limit: limit,
              items: items.slice(offset, offset+limit)
            };
          }

          function application(i){
            return { href: '/applications/' + i,
              name: 'testing ' + i,
              description: i,
              status: 'ENABLED'
            };
          }

          function createNApps(n){
            var items = [];
            for (var i = 0; i < n; i++){
              items.push(application(i));
            }
            return items;
          }

          var i, items, pages = [], applications;
          var sandbox, iteratorSpy, callbackSpy, asyncIteratorSpy, asyncCallbackSpy;

          before(function(done){
            // set up:
            // 1. items
            items = createNApps(n);
            // 2. create app collection resource
            for (i = 0; i < Math.ceil(n/100); i++){
              pages.push(createAppsCollection(items, i*100, (i+1)*100));
            }
            applications = instantiate(Application, pages[0], {}, ds);
            // 3. nock
            nock(u.BASE_URL).get(u.v1(applications.href)).reply(200,pages);
            for (i = 1; i < Math.ceil(n/100); i++) {
              var ref = u.v1(applications.href) + '?' + querystring.stringify({offset: i * 100, limit: 100});
              nock(u.BASE_URL).get(ref).reply(200, pages[i]);
            }
            sandbox = sinon.sandbox.create();
            // 4. iterator and callback spies
            function iterator(memo, item, cb){
              cb(null, memo + item.description);
            }
            iteratorSpy = sandbox.spy(iterator);
            asyncIteratorSpy = sandbox.spy(iterator);

            async.series([
              function(cb){
                function callback(){
                  cb();
                }
                callbackSpy = sandbox.spy(callback);
                applications[method](100500, iteratorSpy, callbackSpy);
              },
              function(cb){
                function callback(){
                  cb();
                }
                asyncCallbackSpy = sandbox.spy(callback);
                async[method](items, 100500, asyncIteratorSpy, asyncCallbackSpy);
              }
            ], done);
          });

          after(function(){
            sandbox.restore();
          });

          it('should call iterators with same arguments', function(){
            for (var i = 0; i < n; i++){
              var asyncArgs = asyncIteratorSpy.getCall(i).args;
              var args = iteratorSpy.getCall(i).args;
              asyncArgs[0].should.be.equal(args[0]);
              asyncArgs[1].should.be.deep.equal(_.pick(args[1], 'href', 'name', 'description', 'status'));
            }
          });

          it('should call iterator n times', function(){
            iteratorSpy.should.have.been.calledBefore(callbackSpy);
            iteratorSpy.callCount.should.be.equal(n);
          });

          it('should call callback once', function(){
            callbackSpy.should.have.been.calledOnce;
            callbackSpy.getCall(0).args[1].should.be.equal(asyncCallbackSpy.getCall(0).args[1]);
          });
        };
      }

      describe('each', test('each'));
      describe('eachSeries', test('eachSeries'));
      describe('eachLimit', testLimit('eachLimit'));
      describe('forEach', test('forEach'));
      describe('forEachSeries', test('forEachSeries'));
      describe('forEachLimit', testLimit('forEachLimit'));
      describe('map', test('map'));
      describe('mapSeries', test('mapSeries'));
      describe('mapLimit', testLimit('mapLimit'));
      describe('filter', testCheck('filter'));
      describe('filterSeries', testCheck('filterSeries'));
      describe('select', testCheck('select'));
      describe('selectSeries', testCheck('selectSeries'));
      describe('reject', testCheck('reject'));
      describe('rejectSeries', testCheck('rejectSeries'));
      describe('reduce', testReduce('reduce'));
      describe('inject', testReduce('inject'));
      describe('foldl', testReduce('foldl'));
      describe('reduceRight', testReduce('reduceRight'));
      describe('foldr', testReduce('foldr'));
      describe('detect', testBoolean('detect', 100));
      describe('detectSeries', testBoolean('detectSeries', 1));
      describe('sortBy', testSortBy('sortBy'));
      describe('some', testBoolean('some', 100));
      describe('any', testBoolean('any', 100));
      describe('every', testBoolean('every'));
      describe('all', testBoolean('all'));
      describe('concat', test('concat'));
      describe('concatSeries', test('concatSeries'));
    });
  });
});