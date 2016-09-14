var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

describe('client credentials authentication',function(){
  var application;
  var newAccount;

  before(function(done) {
    newAccount = helpers.fakeAccount();

    helpers.createApplication(function(err, app) {
      application = app;
      application.createAccount(newAccount, done);
    });
  });

  after(function(done) {
    helpers.cleanupApplicationAndStores(application, done);
  });

  describe('OAuthClientCredentialsTokenGrantAuthenticator', function() {
    it('should be constructable with the new operator', function() {
      var auth = new stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      assert.instanceOf(auth, stormpath.OAuthClientCredentialsRequestAuthenticator);
    });

    it('should be constructable without the new operator', function() {
      var auth = stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      assert.instanceOf(auth, stormpath.OAuthClientCredentialsRequestAuthenticator);
    });

    it('should expect exactly two parameters - the data and the callback', function() {
      var auth = new stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      assert.throws(auth.authorize.bind(auth.authorize), Error, 'Must call authenticate with (data,callback)');
      assert.throws(auth.authorize.bind(auth.authorize, 1), Error, 'Must call authenticate with (data,callback)');
      assert.throws(auth.authorize.bind(auth.authorize, 1, 2, 3), Error, 'Must call authenticate with (data,callback)');
    });

    xit('should construct an OAuthChildCredentialsAuthenticationResult on authentication success', function() {
      // var auth = stormpath.OAuthClientCredentialsRequestAuthenticator(application);
    });

    xit('should handle errors in the authorize method by passing them to the callback', function() {

    });
  });

  describe('OAuthClientCredentialsTokenGrantAuthenticationResult', function() {
    xit('should return the correct account when #getAccount() is called', function() {

    });

    xit('should return  the correct access token when #getAccessToken() is called', function() {

    });

    xit('should return the correct refresh token when #getRefreshToken() is called', function() {

    });
  });

});
