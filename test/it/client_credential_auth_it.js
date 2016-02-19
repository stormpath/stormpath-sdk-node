var nJwt = require('njwt');
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;


describe('Client Credential Authentication',function(){

  var app, account, client, fakeAccount, accessToken;

  before(function(done){
    fakeAccount = helpers.fakeAccount();

    helpers.getClient(function(_client){
      client = _client;

      helpers.createApplication(
        function(err, _app) {
          if(err){ throw err; }
          app = _app;
          app.createAccount(
            fakeAccount,
            function(err,_account){
              if(err){ throw err; }
              account = _account;
              done();
            }
          );
        }
      );
    });
  });

  after(function(done){
    helpers.cleanupApplicationAndStores(app,done);
  });

  describe('AuthenticationResult.getAccessToken()',function(){

    before(function(done){
      app.authenticateAccount({
        username: fakeAccount.username,
        password: fakeAccount.password
      },function(err,authenticationResult){
        if(err){ throw err; }
        accessToken = authenticationResult.getAccessToken();

        done();
      });
    });

    it('should return an access token',function(done){
      assert.isString(accessToken);
      var secret = client._dataStore.requestExecutor.options.client.apiKey.secret;
      nJwt.verify(accessToken,secret,function(err,jwt){
        if(err){ throw err; }
        // The subject should be the account
        assert.equal(jwt.body.sub,account.href);
        // The defalt TTL is 3600 seconds
        assert.equal(jwt.body.exp - jwt.body.iat,3600);
        done();
      });
    });
  });

  describe('Application.authenticateApiRequest',function(){

    var result, result2, result3;
    before(function(done){

      app.authenticateAccount({
        username: account.username,
        password: fakeAccount.password
      },function(err,authenticationResult){
        if(err){ throw err; }

        var requestObject = {
          headers: {
            'authorization': 'Bearer ' + authenticationResult.getAccessToken()
          },
          url: '/some/resource',
          method: 'POST'
        };

        app.authenticateApiRequest({
          request: requestObject
        },function(err,value){
          result = [err,value];

          account.status = 'DISABLED';
          account.save(function(err){
            if(err){ throw err; }
            var requestObject = {
              headers: {
                'authorization': 'Bearer ' + authenticationResult.getAccessToken()
              },
              url: '/some/resource',
              method: 'POST'
            };
            app.authenticateApiRequest({
              request: requestObject
            },function(err,value){
              result2 = [err,value];
              // done();
              account.delete(function(err){
                if(err){ throw err; }
                app.authenticateApiRequest({
                  request: requestObject
                },function(err,value){
                  result3 = [err,value];
                  done();
                });
              });

            });
          });
        });
      });
    });
    it('should validate tokens where the account is the subject',function(){
      assert.equal(result[0],null);
      assert.equal(result[1].account.href,account.href);
    });
    it('should not validate tokens where the account is the subject and the account is disabled',function(){
      assert.isObject(result2[0]);
      assert.equal(result2[0].statusCode,401);
    });
    it('should not validate tokens where the account is the subject and the account has been deleted',function(){
      assert.isObject(result3[0]);
      assert.equal(result3[0].statusCode,401);
    });

  });


});
