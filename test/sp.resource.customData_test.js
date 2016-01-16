/* jshint -W030 */
var common = require('./common');
var expect = common.expect;

var sinon = common.sinon;

var Group = require('../lib/resource/Group');
var Account = require('../lib/resource/Account');
var DataStore = require('../lib/ds/DataStore');
var instantiate = require('../lib/resource/ResourceFactory').instantiate;

describe('Resources: ', function () {
  "use strict";
  describe('CustomData resource class', function () {
    function removeFieldTest(Ctor, href) {
      describe(Ctor.name + ' remove custom data field', function () {
        var dataStore;
        var sandbox, fieldName,
          dcr, dcrJSON,
          deleteHref, cbSpy, deleteResourceStub, saveResourceStub;

        before(function () {
          sandbox = sinon.sandbox.create();
          // arrange
          dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
          fieldName = 'field_name_to_remove';
          dcrJSON = {
            href: 'some_href',
            customData: {href: href}
          };
          dcrJSON.customData[fieldName] = 'boom!';
          dcr = instantiate(Ctor, dcrJSON, null, dataStore);

          cbSpy = sandbox.spy();
          deleteResourceStub = sandbox.stub(dcr.customData.dataStore, 'deleteResource', function (uri, cb) {
            deleteHref = uri;
            cb();
          });

          saveResourceStub = sandbox.stub(dataStore, 'saveResource', function () {
            arguments[arguments.length -1]();
          });

          // act
          dcr.customData.remove(fieldName);
          dcr.save(cbSpy);

          dcr.customData.remove(fieldName);
          dcr.customData.save(cbSpy);
        });
        after(function () {
          sandbox.restore();
        });
        it('should make delete request with field name in href', function () {
          //assert
          deleteResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          deleteHref.href.should.contain(href);
          deleteHref.href.should.contain(fieldName);
        });
      });
    }

    removeFieldTest(Account, '/custom/data/href');
    removeFieldTest(Group, '/custom/data/href/');

    describe('when fetched via resource.getCustomData',function(){
      var resource;
      var dataStore;
      var sandbox;
      var cacheSpy;
      var parentHref;
      var customDataObject;

      before(function(done){
        dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
        sandbox = sinon.sandbox.create();
        cacheSpy = sinon.spy(dataStore.cacheHandler.cacheManager.caches.customData, 'put');
        parentHref = 'http://api.stormpath.com/v1/accounts/' + common.uuid();

        resource = instantiate(Account, {
          href: parentHref,
          customData: {
            href: parentHref + '/customData'
          }
        }, null, dataStore);

        customDataObject = {
          href: resource.customData.href,
          hello: 'world'
        };

        sandbox.stub(dataStore.requestExecutor, 'execute', function (request) {
          // callback with a mock custom data resource
          if(request.uri===resource.customData.href){
            arguments[arguments.length -1](null,customDataObject);
          }
        });
        resource.getCustomData(done);
      });
      it('should have been put in the cache',function(){
        expect(cacheSpy.args[0][1]).to.deep.equal(customDataObject);
      });
    });

    describe('when attached to a resource',function(){
      var resource, dataStore, saveResourceStub, sandbox;

      before(function(){
        dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
        resource = instantiate(Account, {
          href: common.uuid(),
          customData:{
            href: common.uuid()
          }
        }, null, dataStore);
        sandbox = sinon.sandbox.create();
        saveResourceStub = sandbox.stub(dataStore, 'saveResource', function () {
          arguments[arguments.length -1]();
        });

      });
      describe('and reserved properties are added',function(){
        var reserverdFieldName;

        before(function(){
          reserverdFieldName = 'createdAt';

          resource.customData[reserverdFieldName] = common.uuid();
        });
        describe('and save is called on the parent resource',function(){
          before(function(done){
            resource.save(done);
          });
          it('should remove the reserved properties before passing to the dataStore',function(){
            var passedResource = saveResourceStub.args[0][0];
            expect(passedResource.customData[reserverdFieldName]).to.equal(undefined);
          });
        });
      });
      describe('and non-reserved properties are added',function(){
        var customFieldName;
        var customFieldValue;

        before(function(){
          customFieldName = 'myCustomProperty';
          customFieldValue = common.uuid();

          resource.customData[customFieldName] = customFieldValue;
        });
        describe('and save is called on the parent resource',function(){
          before(function(done){
            resource.save(done);
          });
          it('should remove the reserved properties before passing to the dataStore',function(){
            var passedResource = saveResourceStub.args[0][0];
            expect(passedResource.customData[customFieldName]).to.equal(customFieldValue);
          });
        });
      });
    });
  });
});
