/* jshint -W030 */
var common = require('./common');
var sinon = common.sinon;

var CustomData = require('../lib/resource/CustomData');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  "use strict";
  describe('CustomData resource class', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});

    function removeFieldTest(href){
      describe('remove field', function () {
        var sandbox, fieldName, customData,
          deleteHref, cbSpy, deleteResourceStub;
        before(function(){
          sandbox = sinon.sandbox.create();
          // arrange
          cbSpy = sandbox.spy();
          deleteResourceStub = sandbox.stub(dataStore, 'deleteResource',function(uri, cb){
            deleteHref = uri;
            cb();
          });
          fieldName = 'field_name_to_remove';
          customData = new CustomData({href: href}, dataStore);
        });
        after(function(){
          sandbox.restore();
        });
        it('should make delete request with field name in href',function(){
          // act
          customData.remove(fieldName, cbSpy);

          //assert
          deleteResourceStub.should.have.been.calledOnce;
          cbSpy.should.have.been.calledOnce;
          deleteHref.should.contain(href);
          deleteHref.should.contain(fieldName);
        });
      });
    }

    removeFieldTest('/custom/data/href');
    removeFieldTest('/custom/data/href/');
  });
});