
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

    describe('via customData.get',function(){
      var customData;

      before(function(done){
        directory.customData.get(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,directory.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            directory.customData.get(function(err,customData){
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
        directory.getCustomData(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,directory.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            directory.getCustomData(function(err,customData){
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

      function getExpandedDirectory(cb){
        client.getDirectory(
          directory.href,
          { expand: 'customData' },
          function(err, directory){
            if(err){ throw err; }
            cb(directory);
          }
        );
      }

      var customData;

      before(function(done){
        getExpandedDirectory(function(directory){
          customData = directory.customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,directory.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            getExpandedDirectory(function(directory){
              customDataAfterGet = directory.customData;
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
