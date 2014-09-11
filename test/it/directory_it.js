
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Directory = require('../../lib/resource/Directory');

describe('Directory',function(){

  var client, directory, creationResult;

  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.createDirectory(
        {name: helpers.uniqId()},
        function(err, _directory) {
          creationResult = [err,_directory];
          directory = _directory;
          done();
        }
      );
    });
  });

  after(function(done){
    directory.delete(done);
  });

  it('should be create-able',function(){
    assert.equal(creationResult[0],null); // did not error
    assert.instanceOf(directory,Directory);
  });

  describe('custom data',function(){

    var customDataGetResult;

    before(function(done){
      directory.customData.get(function(err,customData){
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
        directory.customData.newProperty = property;
        directory.customData.save(function(err){
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
          directory.customData.get(function(err,customData){
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
