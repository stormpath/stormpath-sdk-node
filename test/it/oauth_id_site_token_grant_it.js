var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

describe('OAuthIdSiteTokenGrantAuthenticator',function(){
  var application;
  var newAccount;

  before(function(done){
    newAccount = helpers.fakeAccount();

    helpers.createApplication(function(err,app){
      application = app;
      application.createAccount(newAccount,done);
    });
  });

  after(function(done){
    helpers.cleanupApplicationAndStores(application, done);
  });

  it('should be constructable with new operator',function(){
    var authenticator = new stormpath.OAuthIdSiteTokenGrantAuthenticator(application);
    assert.instanceOf(authenticator, stormpath.OAuthIdSiteTokenGrantAuthenticator);
  });

  it('should be constructable without new operator',function(){
    var authenticator = stormpath.OAuthIdSiteTokenGrantAuthenticator(application);
    assert.instanceOf(authenticator, stormpath.OAuthIdSiteTokenGrantAuthenticator);
  });
});
