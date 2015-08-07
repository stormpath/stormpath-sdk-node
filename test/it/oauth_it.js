
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

var OAuthPasswordGrantRequestAuthenticator =
  require('../../lib/authc/OAuthPasswordGrantRequestAuthenticator');

function assertPasswordGrantResponse(response){
  assert.isDefined(response.access_token);
  assert.isDefined(response.refresh_token);
}

describe('OAuthPasswordGrantRequestAuthenticator',function(){

  var application, authenticator;

  var newAccount = helpers.fakeAccount();

  before(function(done){
    helpers.createApplication(function(err,app){
      application = app;
      authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
      application.createAccount(newAccount,done);
    });
  });

  it('should be constructable',function(){
    assert.instanceOf(authenticator,OAuthPasswordGrantRequestAuthenticator);
  });

  it('should create access tokens',function(done){
    authenticator.authenticate({
      username: newAccount.username,
      password: newAccount.password
    },function(err,result){
      assert.isNull(err);
      assertPasswordGrantResponse(result);
      done();
    });
  });

});
