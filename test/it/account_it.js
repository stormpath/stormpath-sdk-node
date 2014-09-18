
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Account = require('../../lib/resource/Account');

describe('Account',function(){

  var client, directory, account, creationResult;

  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.createDirectory(
        {name: helpers.uniqId()},
        function(err, _directory) {
          directory = _directory;
          directory.createAccount(
            helpers.fakeAccount(),
            function(err,_account){
              account = _account;
              creationResult = [err,_account];
              done();
            }
          );
        }
      );
    });
  });

  after(function(done){
    account.delete(function(err){
      if(err){
        throw err;
      }else{
        directory.delete(done);
      }
    });
  });

  it('should be create-able from a directory instance',function(){
    assert.equal(creationResult[0],null); // did not error
    assert.instanceOf(account,Account);
  });

  describe('custom data',function(){

    describe('via customData.get',function(){
      var customData;

      before(function(done){
        account.customData.get(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,account.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            account.customData.get(function(err,customData){
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
        account.getCustomData(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,account.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            account.getCustomData(function(err,customData){
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

      function getExpandedAccount(cb){
        client.getAccount(
          account.href,
          { expand: 'customData' },
          function(err, account){
            if(err){ throw err; }
            cb(account);
          }
        );
      }

      var customData;

      before(function(done){
        getExpandedAccount(function(account){
          customData = account.customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,account.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            getExpandedAccount(function(account){
              customDataAfterGet = account.customData;
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
