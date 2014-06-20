
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var ApiKey = require('../../lib/resource/ApiKey');

describe('Account api keys',function(){

  var app, account, client;
  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.createApplication(
        {name: helpers.uniqId()},
        {createDirectory:true},
        function(err, _app) {
          app = _app;
          app.createAccount(
            helpers.fakeAccount(),
            function(err,_account){
              account = _account;
              done();
            }
          );
        }
      );
    });
  });

  after(function(done){
    account.delete(function(){
      app.delete(function(){
        done();
      });
    });
  });

  describe('createApiKey()',function(){

    var result, apiKey;

    before(function(done){
      account.createApiKey(function(err,value){
        apiKey = value;
        result = [err,value];
        done();
      });
    });

    after(function(done){
      apiKey.delete(done);
    });

    it('should not err',function(){
      assert.equal(result[0],null);
    });

    it('should return an instance of ApiKey',function(){
      assert.instanceOf(result[1],ApiKey);
    });

  });

  describe('getApiKeys',function(){

    var result, apiKey;

    before(function(done){
      account.createApiKey(function(err,value){
        apiKey = value;
        account.getApiKeys(function(err,collectionResult){
          result = [err,collectionResult];
          done();
        });
      });
    });

    after(function(done){
      apiKey.delete(done);
    });

    it('should not err',function(){
      assert.equal(result[0],null);
    });

    it('should return some api keys',function(){
      assert.instanceOf(result[1].items[0],ApiKey);
    });

  });

  describe('getApiKeys by id query',function(){

    var result, apiKey1, apiKey2;

    before(function(done){
      account.createApiKey(function(err,value){
        apiKey1 = value;
        account.createApiKey(function(err,value){
          apiKey2 = value;
          account.getApiKeys({id:apiKey2.id},function(err,collectionResult){
            result = [err,collectionResult];
            done();
          });
        });
      });
    });

    after(function(done){
      apiKey1.delete(function(){
        apiKey2.delete(done);
      });
    });

    it('should not err',function(){
      assert.equal(result[0],null);
    });

    it('should return only 1 item',function(){
      assert.equal(result[1].items.length,1);
    });

    it('should return the queried api key',function(){
      assert.equal(result[1].items[0].href,apiKey2.href);
    });

  });

  describe('getApiKeys with alternate encryption options',function(){

    var result, apiKey;

    before(function(done){
      account.createApiKey(function(err,value){
        apiKey = value;

        account.getApiKeys({
          encryptionKeySize: 256,
          encryptionKeyIterations: 512
        },
        function(err,collectionResult){
          result = [err,collectionResult];
          done();
        });

      });
    });

    after(function(done){
      apiKey.delete(done);
    });

    it('should not err',function(){
      assert.equal(result[0],null);
    });

    it('should return some api keys',function(){
      assert.instanceOf(result[1].items[0],ApiKey);
    });

  });

  describe('disable an api key',function(){

    var apiKey, saveResult, cacheResult;

    before(function(done){
      account.createApiKey(function(err,result){
        apiKey = result;
        apiKey.status = 'DISABLED';
        apiKey.save(function(err,updatedApiKey){
          saveResult = [err,updatedApiKey];
          client._dataStore.cacheHandler.get(updatedApiKey.href,function(err,value){
            cacheResult = [err,value];
            done();
          });
        });
      });
    });

    after(function(done){
      apiKey.delete(done);
    });

    it('should have updated the apikey',function(){
      assert.equal(saveResult[1].status,'DISABLED');
    });

    it('should have updated the cache',function(){
      assert.equal(cacheResult[1].status,'DISABLED');
    });

  });

  describe('delete an api key',function(){

    var deleteResult, cacheResult;

    before(function(done){
      account.createApiKey(function(err,apiKey){
        apiKey.delete(function(err){
          deleteResult = [err];
          client._dataStore.cacheHandler.get(apiKey.href,function(err,value){
            cacheResult = [err,value];
            done();
          });
        });
      });
    });

    it('should not err',function(){
      assert.equal(deleteResult[0],null);
    });

    it('should have removed the key from the cache',function(){
      assert.equal(cacheResult[1],null);
    });

  });

});
