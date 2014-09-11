
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Application = require('../../lib/resource/Application');

describe('Application',function(){

  var client, app, creationResult;

  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.createApplication(
        {name: helpers.uniqId()},
        function(err, _app) {
          creationResult = [err,_app];
          app = _app;
          done();
        }
      );
    });
  });

  after(function(done){
    app.delete(done);
  });

  it('should be create-able',function(){
    assert.equal(creationResult[0],null); // did not error
    assert.instanceOf(app,Application);
  });

  describe('custom data',function(){

    var customDataGetResult;

    before(function(done){
      app.customData.get(function(err,customData){
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
        app.customData.newProperty = property;
        app.customData.save(function(err){
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
          app.customData.get(function(err,customData){
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
