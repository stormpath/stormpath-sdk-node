
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

describe('OAuthStormpathTokenAuthenticator', function () {
  var newAccount;
  var application;

  before(function(done){
    newAccount = helpers.fakeAccount();

    helpers.createApplication(function (err, app) {
      application = app;
      application.createAccount(newAccount, done);
    });
  });

  after(function (done) {
    application.delete(done);
  });

  it('should be constructable with new operator',function(){
    var authenticator = new stormpath.OAuthStormpathTokenAuthenticator(application);
    assert.instanceOf(authenticator, stormpath.OAuthStormpathTokenAuthenticator);
    assert.equal(authenticator.application, application);
  });

  it('should be constructable without new operator',function(){
    var authenticator = new stormpath.OAuthStormpathTokenAuthenticator(application);
    assert.instanceOf(authenticator, stormpath.OAuthStormpathTokenAuthenticator);
    assert.equal(authenticator.application, application);
  });
});
