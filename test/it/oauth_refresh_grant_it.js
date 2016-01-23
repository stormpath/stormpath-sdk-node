
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

describe('OAuthRefreshTokenGrantRequestAuthenticator',function(){

  var application, refreshToken;

  var newAccount;

  before(function(done){
    newAccount = helpers.fakeAccount();

    helpers.createApplication(function(err,app){
      if(err){
        done(err);
      }else{
        application = app;
        application.createAccount(newAccount,function(err){
          if(err){
            done(err);
          }else{
            var authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
            authenticator.authenticate({
              username: newAccount.username,
              password: newAccount.password
            },function(err,passwordGrantResult){
              if(err){
                done(err);
              }else{
                refreshToken = passwordGrantResult.refreshToken;
                done();
              }
            });
          }
        });
      }

    });
  });

  after(function(done){
    helpers.cleanupApplicationAndStores(application, done);
  });

  it('should be constructable with new operator',function(){
    var authenticator = new stormpath.OAuthRefreshTokenGrantRequestAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.OAuthRefreshTokenGrantRequestAuthenticator);
  });

  it('should be constructable without new operator',function(){
    var authenticator = stormpath.OAuthRefreshTokenGrantRequestAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.OAuthRefreshTokenGrantRequestAuthenticator);
  });

  it('should refresh access tokens',function(done){
    var authenticator = new stormpath.OAuthRefreshTokenGrantRequestAuthenticator(application);
    authenticator.authenticate({
      refresh_token: refreshToken.toString()
    },function(err,response){
      common.assertAccessTokenResponse(response);
      done();
    });
  });
});
