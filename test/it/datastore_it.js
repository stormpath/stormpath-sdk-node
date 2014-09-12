
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;


describe('Data Store',function(){


  describe('when asked for a resource',function(){

    var cacheResult, resource;

    before(function(done){
      helpers.getClient(function(client){
        client.getCurrentTenant(function(err,tenant){
          resource = tenant;
          if(err){throw err;}
          client._dataStore.cacheHandler.get(tenant.href,function(err,value){
            if(err){throw err;}
            cacheResult = value;
            done();
          });
        });
      });
    });

    it('should cache the resource',function(){
      assert.equal(cacheResult.href,resource.href);
    });
  });

  describe('when asked for a collection',function(){

    var cacheResult;

    before(function(done){
      helpers.getClient(function(client){

        client.getCurrentTenant(function(err,tenant){
          if(err){throw err;}
          tenant.getApplications(function(err,collection){
            if(err){throw err;}
            client._dataStore.cacheHandler.get(collection.href,function(err,value){
              if(err){throw err;}
              cacheResult = value;
              done();
            });
          });
        });
      });
    });

    it('should not cache the collection',function(){
      assert.equal(cacheResult,null);
    });
  });

  describe('when asked for a previously created resource w/ expansions,',function(){
    var directory, expandedDirectory;
    before(function(done){
      helpers.getClient(function(client){

        client.createDirectory(helpers.fakeDirectory(),function(err,_directory){
          if(err){throw err;}
          directory = _directory;
          client.getDirectory(directory.href,{expand:'customData'},function(err,_directory){
            if(err){throw err;}
            expandedDirectory = _directory;
            done();
          });
        });
      });
    });
    after(function(done){
      directory.delete(done);
    });
    it('should return the resource w/ expansions',function(){
      assert.equal(typeof expandedDirectory.customData.createdAt,'string');
    });

  });

});
