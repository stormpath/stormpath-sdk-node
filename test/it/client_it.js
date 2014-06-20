var common = require('../common');
var stormpath = common.Stormpath;
var helpers = require('./helpers');
var assert = common.assert;

describe('Client',function(){
  describe('creation',function(){
    var createClientFn;
    before(function(done){
      helpers.loadApiKey(function(apiKey){
        createClientFn = function createClientFn(){
          new stormpath.Client({apiKey:apiKey});
        };
        done();
      });
    });
    it('should not throw',function(){
      assert.doesNotThrow(createClientFn);
    });
  });
  describe('getCurrentTenant',function(){
    var result;
    var Tenant = require('../../lib/resource/Tenant');
    before(function(done){
      helpers.getClient(function(client){
        client.getCurrentTenant(function(err,tenant){
          result = [err,tenant];
          done();
        });
      });
    });
    it('should not err',function(){
      assert.equal(result[0],null);
    });
    it('should return a tenant instance',function(){
      assert.instanceOf(result[1],Tenant);
    });

  });
});
