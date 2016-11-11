
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;
var async = require('async');
var njwt = require('njwt');
var url = require('url');

var CustomData = require('../../lib/resource/CustomData');
var Application = require('../../lib/resource/Application');
var ApplicationAccountStoreMapping = require('../../lib/resource/ApplicationAccountStoreMapping');
var OAuthPolicy = require('../../lib/resource/OAuthPolicy');

describe('Application',function(){

  var client, app, creationResult, directory, account, mapping, signingKey;

  before(function(done) {
    helpers.getClient(function(_client) {
      client = _client;
      signingKey = client._dataStore.requestExecutor.options.client.apiKey.secret;

      client.createApplication({ name: helpers.uniqId()}, function(err, _app) {
        creationResult = [err, _app];
        app = _app;

        client.createDirectory(helpers.fakeDirectory(),function(err,_directory){
          if(err){ throw err; }
          directory = _directory;
          done();
        });


      });
    });
  });

  after(function(done) {
    async.each([app, directory, account], function(resource, next) {
      if (resource) {
        resource.delete(function(err) {
          next(err);
        });
      } else {
        next();
      }
    }, done);
  });

  describe('createAccountStoreMapping',function(){
    after(function(done){
      mapping.delete(done);
    });
    it('should create an ApplicationAccountStoreMapping',function(done){
      app.createAccountStoreMapping({accountStore:directory},function(err,result){
        if(err){
          done(err);
        }else{
          mapping = result;
          assert(result instanceof ApplicationAccountStoreMapping);
          done();
        }
      });
    });
    it('should handle errors',function(done){
      app.createAccountStoreMapping({accountStore:{href:'not found'}},function(err){
        assert(err.status === 400);
        assert(err.code === 2002);
        done();
      });
    });
  });

  describe('getApplication',function(){
    after(function(done){
      mapping.delete(done);
    });
    it('should return the application',function(done){
      mapping.getApplication(function(err,application){
        if(err){
          done(err);
        }else{
          assert(application instanceof Application);
          done();
        }
      });
    });
  });

  describe('createAccountStoreMappings',function(){
    it('should create an ApplicationAccountStoreMapping',function(done){
      app.createAccountStoreMappings([{accountStore:directory}],function(err,results){
        if(err){
          done(err);
        }else{
          assert(results[0] instanceof ApplicationAccountStoreMapping);
          mapping = results[0];
          done();
        }
      });
    });
  });

  describe('.getAccount()', function() {
    it('should throw an error if providerData is not provided', function() {
      assert.throws(function() {
        app.getAccount(function() {
        });
      }, Error);
    });

    it('should throw an error if callback is not provided', function() {
      assert.throws(function() {
        app.getAccount({ providerData: { providerId: 'google', code: 'xxx' } });
      }, Error);
    });

    it('should throw an error if providerData is not an object', function() {
      assert.throws(function() {
        app.getAccount('https://api.stormpath.com/v1/accounts/xxx', function() {
        });
      }, Error);
    });

    it('should throw an error if providerData.providerId is not a string', function() {
      assert.throws(function() {
        app.getAccount({ providerData: { providerId: 1 } }, function() {});
      }, Error);
    });

    it('should throw an error if either providerData.code or providerData.accessToken are not strings', function() {
      assert.throws(function() {
        app.getAccount({ providerData: { providerId: 'google' } }, function() {});
      }, Error);
    });
  });

  describe('.getOAuthPolicy', function() {
    it('should return an OAuthPolicy instance', function(done){
      app.getOAuthPolicy(function(err, oauthPolicy) {
        if(err){
          done(err);
        }else{
          assert(oauthPolicy instanceof OAuthPolicy);
          done();
        }
      });
    });
  });

  it('should be create-able',function(){
    assert.equal(creationResult[0],null); // did not error
    assert.instanceOf(app,Application);
  });

  describe('setDefaultAccountStore',function () {

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
    var fakeAccount;

    before(function(done){
      fakeAccount = helpers.fakeAccount();

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
  workflows via the REST api. Right now you'll get a 6101
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
        var propertyName;
        var propertyValue;

        before(function(done){
          propertyName = helpers.uniqId();
          propertyValue = helpers.uniqId();

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

  describe('createIdSiteUrl', function () {

    it('Should add require_mfa option to the JWT', function () {
      var options = {
        callbackUri: '/stormpathCallback',
        require_mfa: ['sms']
      };

      var redirectUrl = app.createIdSiteUrl(options);
      var jwt = njwt.verify(url.parse(redirectUrl,true).query.jwtRequest, signingKey);

      assert.deepEqual(jwt.body.require_mfa, options.require_mfa);
    });

    it('Should add challenge option to the JWT', function () {
      var options = {
        callbackUri: '/stormpathCallback',
        challenge: ['https://api.stormpath.com/v1/factors/:factorId']
      };
      var redirectUrl = app.createIdSiteUrl(options);

      var jwt = njwt.verify(url.parse(redirectUrl,true).query.jwtRequest, signingKey);

      assert.deepEqual(jwt.body.challenge, options.challenge);
    });
  });

});
