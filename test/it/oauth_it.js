
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');


var nJwt = require('nJwt');

var OAuthAuthenticationResult = require('../../lib/authc/OAuthAuthenticationResult');

function assertPasswordGrantResponse(response){
  assert.isDefined(response.access_token);
  assert.isDefined(response.refresh_token);
}

function assertUnauthenticatedResponse(done){
  return function(err){
    assert.isNotNull(err);
    assert.equal(err.statusCode,401);
    done();
  };
}

function assertOAuthAuthenticationResult(done){
  return function(err,response){
    assert.isNull(err);
    assert.instanceOf(response, OAuthAuthenticationResult);
    assert.isDefined(response, 'jwt');
    assert.isDefined(response, 'expandedJwt');
    done();
  };
}

describe('OAuth Authenticators',function(){

  var application, passwordGrantResponse;

  var newAccount = helpers.fakeAccount();

  var unsignedToken = nJwt.create({hello:'world'},'not a secret').compact();

  var expiredToken;

  before(function(done){
    helpers.createApplication(function(err,app){
      application = app;

      expiredToken = nJwt.create(
          {hello:'world'},
          application.dataStore.requestExecutor.options.apiKey.secret
        ).setExpiration(new Date().getTime())
        .compact();

      application.createAccount(newAccount,done);

    });
  });



  describe('OAuthPasswordGrantRequestAuthenticator',function(){

    it('should be constructable with new operator',function(){
      var authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
      assert.instanceOf(authenticator,stormpath.OAuthPasswordGrantRequestAuthenticator);
    });

    it('should be constructable without new operator',function(){
      var authenticator = stormpath.OAuthPasswordGrantRequestAuthenticator(application);
      assert.instanceOf(authenticator,stormpath.OAuthPasswordGrantRequestAuthenticator);
    });

    it('should create access tokens',function(done){
      var authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
      authenticator.authenticate({
        username: newAccount.username,
        password: newAccount.password
      },function(err,result){
        assert.isNull(err);
        assertPasswordGrantResponse(result);
        passwordGrantResponse = result;

        done();
      });
    });
  });


  describe('OAuthAuthenticator',function(){


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

    describe('with local authentication',function(){

      var authenticator;

      before(function(){
        authenticator = new stormpath.OAuthAuthenticator(application).withLocalValidation();
      });

      it('should validate access tokens, created via password grant flow, and return an OAuth authentication result',function(done){

        authenticator.authenticate({
          headers: {
            authorization: 'Bearer ' + passwordGrantResponse.access_token
          }
        },assertOAuthAuthenticationResult(done));
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

      it('should be able to read the access token from the default cookie location',function(done){
        authenticator.authenticate({
          cookies: {
            access_token: passwordGrantResponse.access_token
          }
        },assertOAuthAuthenticationResult(done));
      });

      it('should be able to read the access token from a custom cookie location',function(done){
        authenticator.withCookie('customCookieName');
        authenticator.authenticate({
          cookies: {
            customCookieName: passwordGrantResponse.access_token
          }
        },assertOAuthAuthenticationResult(done));
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

      it('should validate access tokens from the password grant flow and return the API response',function(done){
        authenticator.authenticate({
          headers: {
            authorization: 'Bearer ' + passwordGrantResponse.access_token
          }
        },assertOAuthAuthenticationResult(done));
      });
    });



  });
});
