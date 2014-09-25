var jwt = require('jwt-simple');
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var AuthenticationResult = require('../../lib/resource/AuthenticationResult');
var AuthenticationResult = require('../../lib/resource/AuthenticationResult');
describe('Application.authenticateApiRequest',function(){

  var app, account, apiKey, client;
  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.createApplication(
        {name: helpers.uniqId()},
        {createDirectory:true},
        function(err, _app) {
          if(err){ throw err; }
          app = _app;
          app.createAccount(
            helpers.fakeAccount(),
            function(err,_account){
              if(err){ throw err; }
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

  describe('with Authorization: Basic <key>:<secret> (1)',function(){

    describe('with valid credentials',function(){

      var result;

      before(function(done){
        var requestObject = {
          headers: {
            'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
          },
          url: '/some/resource',
          method: 'POST'
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
          url: '/some/resource',
          method: 'POST'
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
        assert.equal(result[0].statusCode,401);
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
            method: 'POST',
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

          it('should return an instance of AuthenticationResult',function(){
            assert.instanceOf(result[1],AuthenticationResult);
          });

          it('should put a tokenResponse on the AuthenticationResult',function(){
            assert.instanceOf(result[1].tokenResponse,Object);
          });
        });

      });


    describe('with valid credentials, as a GET request',function(){

        var result;

        before(function(done){
          var requestObject = {
            headers: {
              'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
            },
            method: 'GET',
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
          it('should err',function(){
            assert.instanceOf(result[0],Error);
            assert.equal(result[0].statusCode,400);
          });

          it('should not return an instance of AuthenticationResult',function(){
            assert.isUndefined(result[1]);
          });

        });

      });

  });

  describe('with Authorization: Basic <key>:<secret> and grant_type=client_credentials in the body',function(){

    var result;

    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
        },
        url: '/some/resource',
        method: 'POST',
        body:{
          grant_type: 'client_credentials'
        }
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

      it('should return an instance of AuthenticationResult',function(){
        assert.instanceOf(result[1],AuthenticationResult);
      });

      it('should put a tokenResponse on the AuthenticationResult',function(){
        assert.instanceOf(result[1].tokenResponse,Object);
      });
    });

  });

  describe('with an invalid jwt value',function(){
    var result;
    before(function(done){

      var requestObject = {
        headers: {
          'authorization': 'Bearer ' + 'this-is-not-a-valid-jwt-value'
        },
        method: 'GET',
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
      assert.equal(result[0].statusCode,401);
      assert.equal(result[0].message,'access_token is invalid');
    });

    it('should not return an instance of AuthenticationResult',function(){
      assert.isUndefined(result[1]);
    });
  });

  describe('with a previously issued access token',function(){
    var customScope = 'custom-scope';
    var accessToken;
    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
        },
        url: '/some/resource',
        body:{
          grant_type: 'client_credentials'
        },
        method: 'POST'
      };
      app.authenticateApiRequest({
        request: requestObject,
        scopeFactory: function() {
          return customScope;
        }
      },function(err,value){
        accessToken = value.tokenResponse.access_token;
        done();
      });
    });
    describe('using Bearer authorization',function(){
      describe('and access_token is passed as Authorization: Bearer <token>',function(){
        var result;
        before(function(done){
          var requestObject = {
            headers: {
              'authorization': 'Bearer ' + accessToken
            },
            method: 'GET',
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

        it('should have the custom scope that was set',function(){
          assert.equal(result[1].grantedScopes[0],customScope);
        });
      });
      describe('and access_token is tampered with',function(){
        var result;
        before(function(done){

          var decodedAccessToken = jwt.decode(accessToken,
            client._dataStore.requestExecutor.options.apiKey.secret,'HS256');
          decodedAccessToken.scope += ' things-i-cant-have';
          var tamperedToken = jwt.encode(decodedAccessToken,'not the same key','HS256');
          var requestObject = {
            headers: {
              'authorization': 'Bearer ' + tamperedToken
            },
            method: 'GET',
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
          assert.equal(result[0].statusCode,401);
          assert.equal(result[0].message,'access_token is invalid');
        });

        it('should not return an instance of AuthenticationResult',function(){
          assert.isUndefined(result[1]);
        });
      });


    });

    describe('using url param',function(){
      describe('and url location search is enabled',function(){
        var result;
        before(function(done){
          var requestObject = {
            headers: {},
            url: '/some/resource?access_token='+accessToken,
            method: 'GET'
          };
          app.authenticateApiRequest({
            request: requestObject,
            locations: ['url']
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
      describe('and url location search is NOT enabled',function(){
        var result;
        before(function(done){
          var requestObject = {
            headers: {},
            url: '/some/resource?access_token='+accessToken,
            method: 'GET'
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
          assert.equal(result[0].statusCode,400);
        });

        it('should not return an instance of AuthenticationResult',function(){
          assert.isUndefined(result[1]);
        });
      });
    });

    describe('using body data',function(){
      var result;
      before(function(done){
        var requestObject = {
          headers: {},
          url: '/some/resource',
          method: 'GET',
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

      it('should return an instance of AuthenticationResult',function(){
        assert.instanceOf(result[1],AuthenticationResult);
      });
    });

  });

  describe('with an expired access token',function(){
    var accessToken;

    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
        },
        method: 'POST',
        url: '/some/resource',
        body:{
          grant_type: 'client_credentials'
        }
      };
      app.authenticateApiRequest({
        request: requestObject,
        ttl: 1
      },function(err,value){
        accessToken = value.tokenResponse.access_token;
        setTimeout(done,2000);
      });
    });

    var result;
    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'Bearer ' + accessToken
        },
        method: 'GET',
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
      assert.equal(result[0].statusCode,401);
      assert.equal(result[0].message,'Token has expired');
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
        url: '/some/resource?grant_type=not_client_Credentials',
        method: 'POST'
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
      assert.equal(result[0].statusCode,400);
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
        method: 'GET',
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
      assert.equal(result[0].statusCode,400);
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
        url: '/some/resource',
        method: 'POST'
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
      assert.equal(result[0].statusCode,400);
    });

    it('should not return an instance of AuthenticationResult',function(){
      assert.isUndefined(result[1]);
    });
  });

  describe('with a scope factory',function(){

    var result;
    var requestedScope = 'scope-a scope-b';
    var givenScope = ['given-scope-a given-scope-b'];
    var scopeFactoryArgs;
    var decodedAccessToken;

    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
        },
        method: 'POST',
        url: '/some/resource?grant_type=client_credentials&scope='+requestedScope
      };
      app.authenticateApiRequest({
        request: requestObject,
        scopeFactory: function(account,requestedScope){
          scopeFactoryArgs = [account,requestedScope];
          return givenScope;
        }
      },function(err,value){
        result = [err,value];
        decodedAccessToken = jwt.decode(result[1].tokenResponse.access_token,
          client._dataStore.requestExecutor.options.apiKey.secret,'HS256');
        done();
      });
    });

    it('should not err',function(){
      assert.equal(result[0],null);
    });

    it('should call the scope factory with the account',function(){
      assert.equal(scopeFactoryArgs[0].href,account.href);
    });

    it('should call the scope factory with the requested scope',function(){
      var requestedScopes = requestedScope.split(' ');
      assert.equal(scopeFactoryArgs[1][0],requestedScopes[0]);
      assert.equal(scopeFactoryArgs[1][1],requestedScopes[1]);
    });

    it('should add the scope to the token',function(){
      assert.equal(decodedAccessToken.scope,givenScope.join(' '));
    });

    it('should add the scope to authResult',function(){
      assert.equal(result[1].tokenResponse.scope,givenScope.join(' '));
    });

  });

  describe('with a custom ttl',function(){

    var result;
    var desiredTtl = 13;
    var tokenResponse;

    before(function(done){
      var requestObject = {
        headers: {
          'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
        },
        method: 'POST',
        url: '/some/resource?grant_type=client_credentials'
      };
      app.authenticateApiRequest({
        request: requestObject,
        ttl: desiredTtl
      },function(err,value){
        result = [err,value];
        tokenResponse = value.tokenResponse;
        done();
      });
    });

    it('should not err',function(){
      assert.equal(result[0],null);
    });

    it('should set the ttl',function(){
      assert.equal(tokenResponse.expires_in,desiredTtl);
    });

  });

  describe('with a disabled account',function(){

    var result;

    before(function(done){
      account.status = 'DISABLED';
      account.save(function(err){
        if(err){
          throw err;
        }

        var requestObject = {
          headers: {
            'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
          },
          method: 'POST',
          url: '/some/resource?grant_type=client_credentials'
        };
        app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
          result = [err,value];
          done();
        });
      });
    });

    it('should err',function(){
      assert.instanceOf(result[0],Error);
      assert.equal(result[0].statusCode,401);
    });

    it('should not return an instance of AuthenticationResult',function(){
      assert.isUndefined(result[1]);
    });

  });


  describe('with a disabled api key',function(){

    var result;

    before(function(done){
      account.status = 'ENABLED';
      account.save(function(err){
        if(err){
          throw err;
        }

        apiKey.status = 'DISABLED';
        apiKey.save(function(err){
          if(err){
            throw err;
          }

          var requestObject = {
            headers: {
              'authorization': 'Basic ' + new Buffer([apiKey.id,apiKey.secret].join(':')).toString('base64')
            },
            method: 'POST',
            url: '/some/resource?grant_type=client_credentials'
          };
          app.authenticateApiRequest({
            request: requestObject
          },function(err,value){
            result = [err,value];
            done();
          });
        });
      });
    });

    it('should err',function(){
      assert.instanceOf(result[0],Error);
      assert.equal(result[0].statusCode,401);
    });

    it('should not return an instance of AuthenticationResult',function(){
      assert.isUndefined(result[1]);
    });

  });


});
