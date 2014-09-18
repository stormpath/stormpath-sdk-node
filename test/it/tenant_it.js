
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Tenant = require('../../lib/resource/Tenant');

describe('Tenant',function(){

  var client, tenant;

  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.getCurrentTenant(
        {name: helpers.uniqId()},
        function(err, _tenant) {
          if(err){ throw err; }
          tenant = _tenant;
          done();
        }
      );
    });
  });

  it('should be get-able',function(){
    assert.instanceOf(tenant,Tenant);
  });

  describe('custom data',function(){

    describe('via customData.get',function(){
      var customData;

      before(function(done){
        tenant.customData.get(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,tenant.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            tenant.customData.get(function(err,customData){
              if(err){ throw err; }
              customDataAfterGet = customData;
              done();
            });
          });
        });
        it('should have the new property persisted',function(){
          assert.equal(customDataAfterGet[propertyName],propertyValue);
        });
      });
    });

    describe('via getCustomData',function(){
      var customData;

      before(function(done){
        tenant.getCustomData(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,tenant.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            tenant.getCustomData(function(err,customData){
              if(err){ throw err; }
              customDataAfterGet = customData;
              done();
            });
          });
        });
        it('should have the new property persisted',function(){
          assert.equal(customDataAfterGet[propertyName],propertyValue);
        });
      });
    });

    describe('via resource expansion',function(){

      function getExpandedTenant(cb){
        client.getCurrentTenant(
          { expand: 'customData' },
          function(err, tenant){
            if(err){ throw err; }
            cb(tenant);
          }
        );
      }

      var customData;

      before(function(done){
        getExpandedTenant(function(tenant){
          customData = tenant.customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,tenant.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            getExpandedTenant(function(tenant){
              customDataAfterGet = tenant.customData;
              done();
            });
          });
        });
        it('should have the new property persisted',function(){
          assert.equal(customDataAfterGet[propertyName],propertyValue);
        });
      });
    });
  });


});
