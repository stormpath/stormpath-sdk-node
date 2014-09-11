
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

    var customDataGetResult;

    before(function(done){
      account.customData.get(function(err,customData){
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

        account.customData.newProperty = property;
        account.customData.save(function(err){
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
          account.customData.get(function(err,customData){
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
