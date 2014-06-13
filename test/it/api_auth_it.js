var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var AuthenticationResult = require('../../lib/resource/AuthenticationResult');
var OauthAccessTokenResult = require('../../lib/resource/OauthAccessTokenResult');

describe('Application',function(){

  var app, account, apiKey;
  before(function(done){
    helpers.getClient(function(client){
      client.createApplication(
        {name: helpers.uniqId()},
        {createDirectory:true},
        function(err, _app) {
          app = _app;
          app.createAccount(
            helpers.fakeAccount(),
            function(err,_account){
              account = _account;
              account.createApiKey(function(err,_apiKey){
                apiKey = _apiKey;
                done();
              });
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

  describe('authenticateApiRequest',function(){

    describe('with Authorization: Basic <key>:<secret>',function(){

      describe('with valid credentials',function(){

        var result;

        before(function(done){
          var requestObject = {
            headers: {
              'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
            },
            url: '/some/resource'
          };
          app.authenticateApiRequest(requestObject,function(err,value){
            result = [err,value];
            done();
          });
        });

        it('should not err',function(){
          assert.equal(result[0],null);
        });

        it('should return an instance of AuthenticationResult',function(){
          assert.instanceOf(result[1],AuthenticationResult);
        });
      });

      describe('with invalid credentials',function(){
        var result;

        before(function(done){
          var requestObject = {
            headers: {
              'authorization': 'Basic ' + new Buffer(['invalid','invalid'].join(':')).toString('base64')
            },
            url: '/some/resource'
          };
          app.authenticateApiRequest(requestObject,function(err,value){
            result = [err,value];
            done();
          });
        });

        it('should err',function(){
          assert.instanceOf(result[0],Error);
        });

        it('should not return an instance of AuthenticationResult',function(){
          assert.isUndefined(result[1]);
        });
      });
    });
  });

  describe('with Authorization: Basic <key>:<secret> and ?grant_type=client_credentials',function(){

    describe('with valid credentials',function(){

        var result;

        before(function(done){
          var requestObject = {
            headers: {
              'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
            },
            url: '/some/resource?grant_type=client_credentials'
          };
          app.authenticateApiRequest(requestObject,function(err,value){
            result = [err,value];
            done();
          });
        });

        it('should not err',function(){
          assert.equal(result[0],null);
        });

        it('should return an instance of OauthAccessTokenResult',function(){
          assert.instanceOf(result[1],OauthAccessTokenResult);
        });

      });

  });

});
