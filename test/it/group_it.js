
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Group = require('../../lib/resource/Group');

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


});
