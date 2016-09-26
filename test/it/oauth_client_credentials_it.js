var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');

var Account = require('../../lib/resource/Account');
var AccessToken = require('../../lib/resource/AccessToken');

describe('OAuthClientCredentialsAuthenticator', function() {
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
        auth = new stormpath.OAuthClientCredentialsAuthenticator(application);
      });

      it('should return an instance of OAuthClientCredentialsAuthenticator', function() {
        assert.instanceOf(auth, stormpath.OAuthClientCredentialsAuthenticator);
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
        auth = stormpath.OAuthClientCredentialsAuthenticator(application);
      });

      it('should return an instance of OAuthClientCredentialsAuthenticator', function() {
        assert.instanceOf(auth, stormpath.OAuthClientCredentialsAuthenticator);
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
    var auth;
    var apiKey;
    var account;
    var badApiKey = {
      id: 'id',
      secret: 'secret'
    };

    before(function(done) {
      auth = new stormpath.OAuthClientCredentialsAuthenticator(application);

      application.createAccount(helpers.fakeAccount(), function(err, accountResponse) {
        if (err) {
          return done(err);
        }

        account = accountResponse;

        account.createApiKey(function(err, apiKeyResponse) {
          if (err) {
            return done(err);
          }

          apiKey = {
            id: apiKeyResponse.id,
            secret: apiKeyResponse.secret
          };

          done();
        });
      });
    });

    after(function() {
      account.delete();
    });

    describe('parameter validation', function() {
      it('should throw an error if the `authenticationRequest` param is not provided, or not an object', function() {
        assert.throws(auth.authenticate.bind(auth), Error, 'The \'authenticationRequest\' parameter must be an object.');
        assert.throws(auth.authenticate.bind(auth, 'boom!'), Error, 'The \'authenticationRequest\' parameter must be an object.');
        assert.doesNotThrow(auth.authenticate.bind(auth, {}), /^The 'authenticationRequest' parameter must be an object\.$/);
      });

      it('should throw an error if the `callback` param is not provided, or not a function', function() {
        assert.throws(auth.authenticate.bind(auth, {}), Error, 'The \'callback\' parameter must be a function.');
        assert.throws(auth.authenticate.bind(auth, {}, {}), Error, 'The \'callback\' parameter must be a function.');
        assert.doesNotThrow(auth.authenticate.bind(auth, {}, function() {}), /^The 'callback' parameter must be a function\.$/);
      });

      it('should throw an error if the `authenticationRequest` param does not have an `apiKey` field', function() {
        assert.throws(auth.authenticate.bind(auth, {}, function() {}), Error, 'apiKey object within request is required');
        assert.doesNotThrow(auth.authenticate.bind(auth, {apiKey: {}}, function() {}), /^apiKey object within request is required$/);
      });

      it('should throw an error if the `authenticationRequest.apiKey` object does not contain the `id` and `secret` fields', function() {
        assert.throws(auth.authenticate.bind(auth, {apiKey: {}}, function() {}), Error, 'apiKey object must contain \'id\' and \'secret\' fields');
        assert.throws(auth.authenticate.bind(auth, {apiKey: {
          id: 'id'
        }}, function() {}), Error, 'apiKey object must contain \'id\' and \'secret\' fields');
        assert.throws(auth.authenticate.bind(auth, {apiKey: {
          secret: 'secret'
        }}, function() {}), Error, 'apiKey object must contain \'id\' and \'secret\' fields');
        assert.doesNotThrow(auth.authenticate.bind(auth, {apiKey: {
          id: 'id',
          secret: 'secret'
        }}, function() {}), /^apiKey object must contain 'id' and 'secret' fields$/);
      });
    });

    describe('calling the method with correct number and type of parameters', function() {
      describe('and the api key is valid', function() {
        it('should succeed with an OAuthClientCredentialsAuthenticationResult', function(done) {
          auth.authenticate({apiKey: apiKey}, function(err, result) {
            if (err) {
              return done(err);
            }

            assert.notOk(err);
            assert.ok(result);
            assert.instanceOf(result, stormpath.OAuthClientCredentialsAuthenticationResult);
            done();
          });
        });
      });

      describe('and the api key is invalid', function() {
        it('should fail with a ResourceError', function() {
          auth.authenticate({apiKey: badApiKey}, function(err, result) {
            assert.ok(err);
            assert.equal(err.name, 'ResourceError');
            assert.equal(err.status, 400);
            assert.equal(err.code, 10019);
            assert.equal(err.developerMessage, 'API Key Authentication failed because the API key or secret submitted is invalid.');
            assert.notOk(result);
          });
        });
      });
    });

    describe('returned OAuthClientCredentialsAuthenticationResult', function() {
      var authResult;

      before(function(done) {
        auth.authenticate({apiKey: apiKey}, function(err, result) {
          if (err) {
            return done(err);
          }

          authResult = result;
          done();
        });
      });

      it('should store the token response', function() {
        assert.property(authResult, 'accessTokenResponse');
      });

      it('should fetch the correct Account via #getAccount', function() {
        var getAccountCallback = function(err, accountResponse) {
          assert.notOk(err);
          assert.ok(accountResponse);
          assert.instanceOf(accountResponse, Account);
          assert.deepEqual(accountResponse, account);
        };

        assert.property(authResult, 'getAccount');
        authResult.getAccount(getAccountCallback);
      });

      it('should fetch an AccessToken via #getAccessToken', function() {
        var getAccessTokenCallback = function(err, accessToken) {
          assert.notOk(err);
          assert.ok(accessToken);
          assert.instanceOf(accessToken, AccessToken);
        };

        assert.property(authResult, 'getAccessToken');
        authResult.getAccessToken(getAccessTokenCallback);
      });
    });

  });
});
