
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');


var nJwt = require('nJwt');

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
    done();
  };
}


describe('OAuthAuthenticator',function(){

  var application, application2, passwordGrantResponse;

  var newAccount = helpers.fakeAccount();

  var unsignedToken = nJwt.create({hello:'world'},'not a secret').compact();

  var expiredToken;
  /*
    Create two applications, one with an oauth policy that
    has a very short access token ttl - for testing token expiration
   */
  before(function(done){
    helpers.createApplication(function(err,app){
      if(err){
        done(err);
      }else{
        application = app;

        expiredToken = nJwt.create(
            {hello:'world'},
            application.dataStore.requestExecutor.options.apiKey.secret
          ).setExpiration(new Date().getTime())
          .compact();

        application.createAccount(newAccount,function(err){
          if(err){
            done(err);
          }else{

            helpers.createApplication(function(err,app2){
              if(err){
                done(err);
              }else{
                application2 = app2;
                /*
                  We are setting the token ttl to 2 seconds, beacuse
                  we want to test expired tokens in this test
                 */
                application2.getOAuthPolicy(function(err,policy){
                  if(err){
                    done(err);
                  }else{
                    policy.accessTokenTtl = 'PT2S';
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
    application.delete(done);
  });

  it('should be constructable with new operator',function(){
    var authenticator = new stormpath.OAuthAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.OAuthAuthenticator);
  });

  it('should be constructable without new operator',function(){
    var authenticator = stormpath.OAuthAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.OAuthAuthenticator);
  });

  it('should throw if not called with a request and callback',function(){
    var authenticator = stormpath.OAuthAuthenticator(application);
    assert.throws(authenticator.authenticate);
  });

  /* this needs to be moved to an oauth authenticator */

  it('should be able to issue tokens for password grant requests', function(done){
    var authenticator = stormpath.OAuthAuthenticator(application);
    authenticator.authenticate({
      body: {
        grant_type: 'password',
        username: newAccount.username,
        password: newAccount.password
      }
    },function(err,result){
      common.assertPasswordGrantResponse(done)(err,result);
      passwordGrantResponse = result;
    });
  });

  it('should return 401 if no auth information is given',function(done){
    var authenticator = stormpath.OAuthAuthenticator(application);
    authenticator.authenticate({},assertUnauthenticatedResponse(done));
  });

  it('should return 401 if the Authorization header is not Bearer',function(done){
    var authenticator = stormpath.OAuthAuthenticator(application);
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
            new stormpath.OAuthAuthenticator(application2)
              .authenticate({
                headers: {
                  authorization: 'Bearer ' + passwordGrantResponse.accessToken.toString()
                }
              },assertUnauthenticatedResponse(done));
          },5000);
        }
      });

  });

  describe('with local authentication',function(){

    var authenticator;

    before(function(){
      authenticator = new stormpath.OAuthAuthenticator(application).withLocalValidation();
    });

    it('should validate access tokens from Bearer header and return a JwtAuthenticationResult',function(done){

      authenticator.authenticate({
        headers: {
          authorization: 'Bearer ' + passwordGrantResponse.accessToken
        }
      },assertJwtAuthenticationResult(done));
    });

    it('should return 401 if the access token is not signed by the application',function(done){
      authenticator.authenticate({
        headers: {
          authorization: 'Bearer ' + unsignedToken
        }
      },assertUnauthenticatedResponse(done));
    });

    it('should return 401 if the token is expired',function(done){
      authenticator.authenticate({
        headers: {
          authorization: 'Bearer ' + expiredToken
        }
      },assertUnauthenticatedResponse(done));
    });

  });

  describe('with remote authentication',function(){

    var authenticator;

    before(function(){
      authenticator = new stormpath.OAuthAuthenticator(application);
    });

    it('should return 401 if the access token is not signed by the application',function(done){
      authenticator.authenticate({
        headers: {
          authorization: 'Bearer ' + unsignedToken
        }
      },assertUnauthenticatedResponse(done));
    });

    it('should return 401 if the token is expired',function(done){
      authenticator.authenticate({
        headers: {
          authorization: 'Bearer ' + expiredToken
        }
      },assertUnauthenticatedResponse(done));
    });

    it('should validate access tokens and return a JwtAuthenticationResult',function(done){
      authenticator.authenticate({
        headers: {
          authorization: 'Bearer ' + passwordGrantResponse.accessToken.toString()
        }
      },assertJwtAuthenticationResult(done));
    });
  });



});

