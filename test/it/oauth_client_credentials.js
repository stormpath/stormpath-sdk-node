var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

describe('OAuthClientCredentialsRequestAuthenticator', function() {
  var newAccount;
  var application;

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

  describe('object construction', function() {
    describe('with new operator', function() {
      var auth;

      before(function() {
        auth = new stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      });

      it('should return an instance of OAuthClientCredentialsAuthenticator', function() {
        assert.instanceOf(auth. stormpath.OAuthClientCredentialsAuthenticator);
      });

      it('should return a new instance', function() {
        var auth2 = new stormpath.OAuthClientCredentialsAuthenticator(application);

        assert.notEqual(auth, auth2);
      });

      it('should construct an instance with the `application` property', function() {
        assert.property(auth, 'application');
        assert.equal(auth.application, application);
      });
    });

    describe('without new operator', function() {
      var auth;

      before(function() {
        auth = stormpath.OAuthClientCredentialsRequestAuthenticator(application);
      });

      it('should return an instance of OAuthClientCredentialsAuthenticator', function() {
        assert.instanceOf(auth. stormpath.OAuthClientCredentialsAuthenticator);
      });

      it('should return a new instance', function() {
        var auth2 = stormpath.OAuthClientCredentialsAuthenticator(application);

        assert.notEqual(auth, auth2);
      });

      it('should construct an instance with the `application` property', function() {
        assert.property(auth, 'application');
        assert.equal(auth.application, application);
      });
    });
  });

  describe('calling the #authenticate(data, callback) method', function() {
    var auth = new stormpath.OAuthClientCredentialsRequestAuthenticator(application);
    var apiKey = application.dataStore.requestExecutor.options.client.apiKey;
    var badApiKey = {
      id: 'id',
      secret: 'secret'
    };

    describe('parameter validation', function() {
      it('should throw an error if the `data` param is not provided, or not an object', function() {
        assert.throws(auth.authorize.bind(auth), Error, 'The \'data\' parameter must be an object.');
        assert.throws(auth.authorize.bind(auth, null), Error, 'The \'data\' parameter must be an object.');
        assert.throws(auth.authorize.bind(auth, 'boom!'), Error, 'The \'data\' parameter must be an object.');
        assert.doesNotThrow(auth.authorize.bind(auth, {}), Error, 'The \'data\' parameter must be an object.');
      });

      it('should throw an error if the `callback` param is not provided, or not a function', function() {
        assert.throws(auth.authorize.bind(auth, {}), Error, 'The \'callback\' parameter must be a function.');
        assert.throws(auth.authorize.bind(auth, {}, {}), Error, 'The \'callback\' parameter must be a function.');
        assert.doesNotThrow(auth.authorize.bind(auth, {}, function() {}), Error, 'The \'callback\' parameter must be a function.');
      });

      it('should throw an error if the `data` param does not have an `apiKey` field', function() {
        assert.throws(auth.authorize.bind(auth, {}, function() {}), Error, 'apiKey object within request is required');
        assert.doesNotThrow(auth.authorize.bind(auth, {apiKey: null}, function() {}), Error, 'apiKey object within request is required');
      });

      it('should throw an error if the `data.apiKey` object does not contain the `id` and `secret` fields', function() {
        assert.throws(auth.authorize.bind(auth, {apiKey: {}}, function() {}), Error, 'apiKey object must contain \'id\' and \'secret\' fields');
        assert.throws(auth.authorize.bind(auth, {apiKey: {
          id: 'id'
        }}, function() {}), Error, 'apiKey object must contain \'id\' and \'secret\' fields');
        assert.throws(auth.authorize.bind(auth, {apiKey: {
          secret: 'secret'
        }}, function() {}), Error, 'apiKey object must contain \'id\' and \'secret\' fields');
        assert.doesNotThrow(auth.authorize.bind(auth, {apiKey: {
          id: 'id',
          secret: 'secret'
        }}, function() {}), Error, 'apiKey object must contain \'id\' and \'secret\' fields');
      });
    });

    describe('calling the method with correct number and type of parameters', function() {
      describe('and the api key is valid', function() {
        it('should succeed with an OAuthClientCredentialsAuthenticationResult', function() {
          auth.authorize({apiKey: apiKey}, function(err, result) {
            assert.notOk(err);
            assert.ok(result);
            assert.instanceOf(result, stormpath.OAuthClientCredentialsAuthenticationResult);
          });
        });
      });

      describe('and the api key is invalid', function() {
        auth.authorize({apiKey: badApiKey}, function(err, result) {
          assert.ok(err);
          assert.equal(err.name, 'ResourceError');
          assert.equal(err.status, 400);
          assert.equal(err.code, 10019);
          assert.equal(err.developerMessage, 'API Key Authentication failed because the API key or secret submitted is invalid.');
          assert.notOk(result);
        });
      });
    });

    describe('returned OAuthClientCredentialsAuthenticationResult', function() {

    });

  });
});
