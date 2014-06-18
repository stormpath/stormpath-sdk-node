var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var AuthenticationResult = require('../../lib/resource/AuthenticationResult');
var OauthAccessTokenResult = require('../../lib/resource/OauthAccessTokenResult');
var OauthAuthenticationResult = require('../../lib/resource/OauthAuthenticationResult');
describe('Application',function(){

  var app, account, apiKey, client;
  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
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
        app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
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
        app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
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
          app.authenticateApiRequest({
            request: requestObject
          },function(err,value){
            result = [err,value];
            done();
          });
        });

        describe('the authentication result',function(){
          it('should not err',function(){
            assert.equal(result[0],null);
          });

          it('should return an instance of OauthAccessTokenResult',function(){
            assert.instanceOf(result[1],OauthAccessTokenResult);
          });
        });

      });

  });

  describe('with a previously issued access token',function(){
    var accessToken;
    before(function(){
      // manually generate an access token
      var oauthAccessTokenResult = new OauthAccessTokenResult(apiKey,client._dataStore);
      oauthAccessTokenResult.setApplicationHref(app.href);
      accessToken = oauthAccessTokenResult.getTokenResponse().access_token;
    });
    describe('using Bearer authorization',function(){
      describe('and access_token is passed verbatim',function(){
        var result;
        before(function(done){
          var requestObject = {
            headers: {
              'authorization': 'Bearer ' + accessToken
            },
            url: '/some/resource'
          };
          app.authenticateApiRequest({
            request: requestObject
          },function(err,value){
            result = [err,value];
            done();
          });
        });
        it('should not err',function(){
          assert.equal(result[0],null);
        });

        it('should return an instance of OauthAuthenticationResult',function(){
          assert.instanceOf(result[1],OauthAuthenticationResult);
        });
      });
      describe('and access_token is tampered with',function(){
        var result;
        before(function(done){
          var tamperedToken = accessToken.replace(/e/,'b');
          var requestObject = {
            headers: {
              'authorization': 'Bearer ' + tamperedToken
            },
            url: '/some/resource'
          };
          app.authenticateApiRequest({
            request: requestObject
          },function(err,value){
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

    describe('using url param',function(){
      var result;
      before(function(done){
        var requestObject = {
          headers: {},
          url: '/some/resource?access_token='+accessToken
        };
        app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
          result = [err,value];
          done();
        });
      });
      it('should not err',function(){
        assert.equal(result[0],null);
      });

      it('should return an instance of OauthAuthenticationResult',function(){
        assert.instanceOf(result[1],OauthAuthenticationResult);
      });
    });

    describe('using body data',function(){
      var result;
      before(function(done){
        var requestObject = {
          headers: {},
          url: '/some/resource',
          body: {
            access_token: accessToken
          }
        };
        app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
          result = [err,value];
          done();
        });
      });
      it('should not err',function(){
        assert.equal(result[0],null);
      });

      it('should return an instance of OauthAuthenticationResult',function(){
        assert.instanceOf(result[1],OauthAuthenticationResult);
      });
    });

  });

  describe('with an expired access token',function(){
    var accessToken;
    before(function(done){
      // manually generate an expired access token
      var oauthAccessTokenResult = new OauthAccessTokenResult(apiKey,client._dataStore);
      oauthAccessTokenResult.setApplicationHref(app.href);
      oauthAccessTokenResult.setTtl(1);
      accessToken = oauthAccessTokenResult.getTokenResponse().access_token;
      setTimeout(done,2000);
    });

    var result;
    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'Bearer ' + accessToken
        },
        url: '/some/resource'
      };
      app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
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

  describe('with invalid grant type',function(){
    var result;
    before(function(done){
      var requestObject = {
        headers: { },
        url: '/some/resource?grant_type=not_client_Credentials'
      };
      app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
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

  describe('with invalid authorization type',function(){
    var result;
    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'pretty please'
        },
        url: '/some/resource'
      };
      app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
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

  describe('without any of the expected values',function(){
    var result;
    before(function(done){
      var requestObject = {
        headers: { },
        url: '/some/resource'
      };
      app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
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

  // TODO with setting custom scope (via scope factory)

  // TODO with settting custom ttl

});
