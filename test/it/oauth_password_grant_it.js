
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

describe('OAuthPasswordGrantRequestAuthenticator',function(){

  var application;

  var newAccount = helpers.fakeAccount();

  before(function(done){
    helpers.createApplication(function(err,app){
      application = app;


      application.createAccount(newAccount,done);

    });
  });

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
    },common.assertPasswordGrantResponse(done));
  });
});
