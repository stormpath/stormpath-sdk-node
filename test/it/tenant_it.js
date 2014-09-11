
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
          if(err){
            throw err;
          }

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

    var customDataGetResult;

    before(function(done){
      tenant.customData.get(function(err,customData){
        customDataGetResult = [err,customData];
        done();
      });
    });

    it('should be get-able',function(){
      assert.equal(customDataGetResult[0],null); // did not error
      assert.instanceOf(customDataGetResult[1],CustomData);
    });

    describe('when saved',function(){
      var saveResult;
      var property = helpers.uniqId();
      before(function(done){
        tenant.customData.newProperty = property;
        tenant.customData.save(function(err){
          saveResult = [err];
          done();
        });
      });
      it('should not error',function(){
        assert.equal(saveResult[0],null);
      });

      describe('and re-fetched',function(){
        var customDataAfterGet;
        before(function(done){
          tenant.customData.get(function(err,customData){
            customDataAfterGet = customData;
            done();
          });
        });
        it('should have the new property persisted',function(){
          assert.equal(customDataAfterGet.newProperty,property);
        });
      });
    });
  });


});
