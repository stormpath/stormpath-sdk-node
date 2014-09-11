
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Group = require('../../lib/resource/Group');
var Account = require('../../lib/resource/Account');

describe('Group',function(){

  var client, directory, group, creationResult;

  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.createDirectory(
        {name: helpers.uniqId()},
        function(err, _directory) {
          directory = _directory;
          directory.createGroup(
            {name: 'it-group-'+helpers.uniqId()},
            function(err,_group){
              group = _group;
              creationResult = [err,_group];
              done();
            }
          );

        }
      );
    });
  });

  after(function(done){
    group.delete(function(err){
      if(err){
        throw err;
      }else{
        directory.delete(done);
      }
    });
  });

  it('should be create-able from a directory instance',function(){
    assert.equal(creationResult[0],null); // did not error
    assert.instanceOf(group,Group);
  });

  describe('custom data',function(){

    var customDataGetResult;

    before(function(done){
      group.customData.get(function(err,customData){
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

        group.customData.newProperty = property;
        group.customData.save(function(err){
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
          group.customData.get(function(err,customData){
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

  describe('name',function(){
    var saveResult, getResult;
    var newName = 'it-group-'+helpers.uniqId();
    before(function(done){

      group.name = newName;
      group.save(function(err){
        saveResult = [err];
        client.getGroup(group.href,function(err,_group){
          getResult = [err,_group];
          done();
        });
      });
    });
    it('should be save-sable',function(){
      assert.equal(saveResult[0],null);
    });
    it('should be persisted after a save',function(){
      assert.equal(getResult[0],null); // did not error
      assert.equal(getResult[1].name,newName); // did not error
    });
  });

  describe('description',function(){
    var saveResult, getResult;
    var newDescription = 'it-group-description'+helpers.uniqId();
    before(function(done){

      group.description = newDescription;
      group.save(function(err){
        saveResult = [err];
        client.getGroup(group.href,function(err,_group){
          getResult = [err,_group];
          done();
        });
      });
    });
    it('should be save-sable',function(){
      assert.equal(saveResult[0],null);
    });
    it('should be persisted after a save',function(){
      assert.equal(getResult[0],null); // did not error
      assert.equal(getResult[1].description,newDescription); // did not error
    });
  });

  describe('accounts',function(){
    var account, creationResult;
    before(function(done){
      directory.createAccount(helpers.fakeAccount(),function(err,_account){
        if(err){
          throw err;
        }
        group.addAccount(_account,function(){
          creationResult = [err,_account];
          account = _account;
          done();
        });
      });
    });
    it('should be assignable as group memberships',function(){
      assert.equal(creationResult[0],null);
      assert.instanceOf(account,Account);
    });

    describe('through getAccounts',function(){
      var result;
      before(function(done){
        group.getAccounts(function(err,accounts){
          result = [err,accounts];
          done();
        });
      });
      it('should be found',function(){
        assert.equal(result[0],null);
        assert.equal(account.href,result[1].items[0].href);
      });
    });

    describe('through getAccountMemberships',function(){
      var result;
      before(function(done){
        group.getAccountMemberships(function(err,memberships){
          result = [err,memberships];
          done();
        });
      });
      it('should be found',function(){
        assert.equal(result[0],null);
        assert.equal(result[1].items[0].account.href,account.href);
      });
    });

  });
});
