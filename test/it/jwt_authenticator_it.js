
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');


var nJwt = require('njwt');

var JwtAuthenticationResult = require('../../lib/jwt/jwt-authentication-result');

function assertUnauthenticatedResponse(done){
  return function(err){
    assert.isNotNull(err);
    assert.equal(err.statusCode,401);
    done();
  };
}

function assertJwtAuthenticationResult(done){
  return function(err,response){
    assert.isNull(err);
    assert.instanceOf(response, JwtAuthenticationResult);
    assert.isDefined(response, 'jwt');
    assert.isDefined(response, 'expandedJwt');
    assert.isDefined(response.account);
    done();
  };
}


describe('JwtAuthenticator',function(){

  var application, application2, passwordGrantResponse;

  var newAccount;

  var unsignedToken;

  var expiredToken;
  /*
    Create two applications, one with an oauth policy that
    has a very short access token ttl - for testing token expiration
   */
  before(function(done){
    newAccount = helpers.fakeAccount();
    unsignedToken = nJwt.create({hello:'world'},'not a secret').compact();

    helpers.createApplication(function(err,app){
      if(err){
        done(err);
      }else{
        application = app;

        expiredToken = nJwt.create(
            {hello:'world'},
            application.dataStore.requestExecutor.options.client.apiKey.secret
          ).setExpiration(new Date().getTime())
          .compact();

        application.createAccount(newAccount,function(err){
          if(err){
            done(err);
          }else{
            new stormpath.OAuthPasswordGrantRequestAuthenticator(application)
              .authenticate({
                username: newAccount.email,
                password: newAccount.password
              },function(err,accessTokenResponse){
                passwordGrantResponse = accessTokenResponse;
              });

            helpers.createApplication(function(err,app2){
              if(err){
                done(err);
              }else{
                application2 = app2;
                /*
                  We are setting the token ttl to 10 seconds, beacuse
                  we want to test expired tokens in this test
                 */
                application2.getOAuthPolicy(function(err,policy){
                  if(err){
                    done(err);
                  }else{
                    policy.accessTokenTtl = 'PT10S';
                    policy.save(function(err){
                      if(err){
                        done(err);
                      }else{
                        application2.createAccount(newAccount,done);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

    });
  });

  after(function(done){
    helpers.cleanupApplicationAndStores(application,function(err){
      if (err) {
        return done(err);
      }
      helpers.cleanupApplicationAndStores(application2, done);
    });
  });

  it('should be constructable with new operator',function(){
    var authenticator = new stormpath.JwtAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.JwtAuthenticator);
  });

  it('should be constructable without new operator',function(){
    var authenticator = stormpath.JwtAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.JwtAuthenticator);
  });

  it('should throw if not called with a request and callback',function(){
    var authenticator = stormpath.JwtAuthenticator(application);
    assert.throws(authenticator.authenticate);
  });

  it('should return 401 if no auth information is given',function(done){
    var authenticator = stormpath.JwtAuthenticator(application);
    authenticator.authenticate({},assertUnauthenticatedResponse(done));
  });

  it('should return 401 if the Authorization header is not Bearer',function(done){
    var authenticator = stormpath.JwtAuthenticator(application);
    authenticator.authenticate({
      headers: {
        authorization: 'Basic abc'
      }
    },assertUnauthenticatedResponse(done));
  });

  it('should reject expired tokens',function(done){

    new stormpath.OAuthPasswordGrantRequestAuthenticator(application2)
      .authenticate({
        username: newAccount.username,
        password: newAccount.password
      },function(err,passwordGrantResponse){
        if(err){
          done(err);
        }else{
          setTimeout(function(){
            new stormpath.JwtAuthenticator(application2)
              .authenticate({
                headers: {
                  authorization: 'Bearer ' + passwordGrantResponse.accessToken.toString()
                }
              },assertUnauthenticatedResponse(done));
          },10000);
        }
      });

  });

  describe('with local authentication',function(){

    var authenticator;

    before(function(){
      authenticator = new stormpath.JwtAuthenticator(application).withLocalValidation();
    });

    it('should validate access tokens from Bearer header and return a JwtAuthenticationResult',function(done){

      authenticator.authenticate(passwordGrantResponse.accessToken.toString(),assertJwtAuthenticationResult(done));
    });

    it('should return 401 if the access token is not signed by the application',function(done){
      authenticator.authenticate(unsignedToken,assertUnauthenticatedResponse(done));
    });

    it('should return 401 if the token is expired',function(done){
      authenticator.authenticate(expiredToken,assertUnauthenticatedResponse(done));
    });
  });

  describe('with remote authentication',function(){

    var authenticator;

    before(function(){
      authenticator = new stormpath.JwtAuthenticator(application);
    });

    it('should return 401 if the access token is not signed by the application',function(done){
      authenticator.authenticate(unsignedToken,assertUnauthenticatedResponse(done));
    });

    it('should return 401 if the token is expired',function(done){
      authenticator.authenticate(expiredToken,assertUnauthenticatedResponse(done));
    });

    it('should validate access tokens and return a JwtAuthenticationResult',function(done){
      authenticator.authenticate(passwordGrantResponse.accessToken.toString(),assertJwtAuthenticationResult(done));
    });
  });

  describe('JwtAuthenticationResult', function() {
    var authenticator;
    var authResult;

    before(function(done) {
      authenticator = new stormpath.JwtAuthenticator(application);
      authenticator.authenticate(passwordGrantResponse.accessToken.toString(), function(err, result) {
        if (err) {
          return done(err);
        }

        authResult = result;
        done();
      });
    });

    describe('#getAccount()', function() {
      it('should support expansion options for the Account query', function(done) {
        authResult.getAccount({expand: 'groups'}, function(err, account) {
          if (err) {
            return done(err);
          }

          assert.instanceOf(account, require('../../lib/resource/Account'));
          assert.isDefined(account.groups);
          assert.isDefined(account.groups.size);
          assert.isDefined(account.groups.limit);
          assert.isDefined(account.groups.offset);
          assert.isDefined(account.groups.items);
          done();
        });
      });
    });
  });
});
