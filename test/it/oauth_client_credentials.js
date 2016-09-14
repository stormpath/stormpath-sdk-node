var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;
var sinon = common.sinon;

var stormpath = require('../../');

describe('client credentials authentication',function(){
  var application;
  var newAccount;
  var sandbox;
  var getResourceSpy;
  var cbSpy;
  var raiseError = false;
  var fakeApiParams = {
    apiKey: {
      id: 'id',
      secret: 'secret'
    }
  };
  var fakeData = {
    key: 'value'
  };

  before(function(done) {
    newAccount = helpers.fakeAccount();
    sandbox = sinon.sandbox.create();

    helpers.createApplication(function(err, app) {
      application = app;
      application.createAccount(newAccount, done);
    });

    getResourceSpy = sinon.stub(application.dataStore, 'getResource', function(href, opts, cb) {
      if (raiseError) {
        cb(new Error('boom!'));
      }

      cb(null, fakeData);
    });

    cbSpy = sinon.spy();
  });

  after(function(done) {
    helpers.cleanupApplicationAndStores(application, done);
    sandbox.restore();
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
      assert.doesNotThrow(auth.authorize.bind(auth.authorize, 1, 2), Error, 'Must call authenticate with (data,callback)');
      assert.throws(auth.authorize.bind(auth.authorize, 1, 2, 3), Error, 'Must call authenticate with (data,callback)');

      /* jshint -W030 */
      getResourceSpy.should.have.been.calledOnce;
      /* jshint +W030 */
    });

    it('should call the application\'s oAuth endpoint', function() {
      var auth = stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      auth.authorize(fakeApiParams, cbSpy);

      /* jshint -W030 */
      getResourceSpy.should.have.been.calledThrice;
      getResourceSpy.should.have.been.calledWith(application.href + '/oauth/token');
      cbSpy.should.have.been.calledOnce;
      /* jshint +W030 */
    });

    it('should format the apiKey data object into a {client_id, client_secret, grant_type} object before calling the API', function() {
      var formattedFakeData = {
        client_id: 'id',
        client_secret: 'secret',
        grant_type: 'client_credentials'
      };

      var auth = stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      auth.authorize(fakeApiParams, cbSpy);

      /* jshint -W030 */
      getResourceSpy.should.have.been.calledThrice;
      getResourceSpy.should.have.been.calledWith(application.href + '/oauth/token', formattedFakeData);
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should construct an OAuthChildCredentialsAuthenticationResult from the REST API call on authentication success', function() {
      var auth = stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      auth.authorize(fakeApiParams, cbSpy);

      /* jshint -W030 */
      cbSpy.should.have.been.called;
      cbSpy.should.have.been.calledThrice;
      /* jshint +W030 */

      var spyCall = cbSpy.getCall(2);
      //0 is error, 1 is object
      assert.instanceOf(spyCall.args[1], stormpath.OAuthClientCredentialsTokenGrantAuthenticationResult);

    });

    it('should handle errors in the authorize method by passing them to the callback', function() {
      raiseError = true;

      var auth = stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      auth.authorize(fakeApiParams, cbSpy);

      /* jshint -W030 */
      cbSpy.should.have.been.called;
      cbSpy.should.have.callCount(4);
      cbSpy.should.have.been.calledWith(new Error('boom!'));
      /* jshint +W030 */

      raiseError = false;
    });
  });

  describe('OAuthClientCredentialsTokenGrantAuthenticationResult', function() {
    // xit('should return the correct account when #getAccount() is called', function() {
    //
    // });
    //
    // xit('should return  the correct access token when #getAccessToken() is called', function() {
    //
    // });
    //
    // xit('should return the correct refresh token when #getRefreshToken() is called', function() {
    //
    // });
  });

});
