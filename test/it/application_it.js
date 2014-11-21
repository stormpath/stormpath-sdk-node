
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;
var async = require('async');

var CustomData = require('../../lib/resource/CustomData');
var Application = require('../../lib/resource/Application');

describe('Application',function(){

  var client, app, creationResult, directory, account;

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
    // cleanup, delete resources that were created
    async.each([app,directory,account],function(resource,next){
      resource.delete(function(err){
        if(err){ throw err; }
        next();
      });
    },done);
  });

  it('should be create-able',function(){
    assert.equal(creationResult[0],null); // did not error
    assert.instanceOf(app,Application);
  });

  describe('setDefaultAccountStore',function () {
    before(function(done){
      client.createDirectory(helpers.fakeDirectory(),function(err,_directory){
        if(err){ throw err; }
        directory = _directory;
        done();
      });
    });
    describe('with a href string property',function(){
      var result;
      before(function(done){
        app.setDefaultAccountStore(directory.href,function(err){
          result = err;
          done();
        });
      });
      it('should not err',function(){
        assert.equal(result,null);
      });
    });
    describe('with a directory object',function(){
      var result;
      before(function(done){
        app.setDefaultAccountStore(directory,function(err){
          result = err;
          done();
        });
      });
      it('should not err',function(){
        assert.equal(result,null);
      });
    });
  });

  describe('authenticateAccount',function(){
    var fakeAccount = helpers.fakeAccount();
    before(function(done){
      directory.createAccount(fakeAccount,function(err,_account){
        if(err){ throw err; }
        account = _account;
        done();
      });
    });
    describe('with username',function(){
      var result;
      before(function(done){
        app.authenticateAccount({
          username: fakeAccount.username,
          password: fakeAccount.password
        },function(err,authenticationResult){
          result = [err,authenticationResult];
          done();
        });
      });
      it('should not err',function(){
        assert.equal(result[0],null);
      });
      it('should expand the account',function(){
        assert.equal(result[1].account.href,account.href);
        assert.equal(result[1].account.username,account.username);
      });
    });
    describe('with email',function(){
      var result;
      before(function(done){
        app.authenticateAccount({
          username: fakeAccount.email,
          password: fakeAccount.password
        },function(err,authenticationResult){
          result = [err,authenticationResult];
          done();
        });
      });
      it('should not err',function(){
        assert.equal(result[0],null);
      });
      it('should expand the account',function(){
        assert.equal(result[1].account.href,account.href);
        assert.equal(result[1].account.email,account.email);
      });
    });
  });

  /*

  TODO bring this test in once we can configure the directory
  workflows via the REST api.  Right now yo'll get a 6101
  error because the diretory has not been configured for
  verification emails

  describe('resendVerificationEmail',function(){
    var fakeAccount = helpers.fakeAccount();
    before(function(done){
      directory.createAccount(fakeAccount,function(err,_account){
        if(err){ throw err; }
        account = _account;
        done();
      });
    });
    describe('with username',function(){
      var result;
      before(function(done){
        app.resendVerificationEmail({
          login: fakeAccount.email
        },function(err,authenticationResult){
          console.log(err);
          result = [err,authenticationResult];
          done();
        });
      });
      it('should not err',function(){
        assert.equal(result[0],null);
      });
      it('should be an accepted response',function(){
        assert.equal(result[1].accepted,true);
      });
    });

  });

  */

  describe('custom data',function(){

    describe('via getCustomData',function(){
      var customData;

      before(function(done){
        app.getCustomData(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,app.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            app.getCustomData(function(err,customData){
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

    // TODO bring back this test once the application
    // expansion issue is fixed in the API

    // describe('via resource expansion',function(){

    //   function getExpandedApplication(cb){
    //     client.getApplication(
    //       { expand: 'customData' },
    //       function(err, app){
    //         if(err){ throw err; }
    //         cb(app);
    //       }
    //     );
    //   }

    //   var customData;

    //   before(function(done){
    //     getExpandedApplication(function(app){
    //       customData = app.customData;
    //       done();
    //     });
    //   });

    //   it('should be get-able',function(){
    //     assert.instanceOf(customData,CustomData);
    //     assert.equal(customData.href,app.href+'/customData');
    //   });

    //   describe('when saved and re-fetched',function(){
    //     var customDataAfterGet;
    //     var propertyName = helpers.uniqId();
    //     var propertyValue = helpers.uniqId();
    //     before(function(done){
    //       customData[propertyName] = propertyValue;
    //       customData.save(function(err){
    //         if(err){ throw err; }
    //         getExpandedApplication(function(tenant){
    //           customDataAfterGet = tenant.customData;
    //           done();
    //         });
    //       });
    //     });
    //     it('should have the new property persisted',function(){
    //       assert.equal(customDataAfterGet[propertyName],propertyValue);
    //     });
    //   });
    // });
  });


});
