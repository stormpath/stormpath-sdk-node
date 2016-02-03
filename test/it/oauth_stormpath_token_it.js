'use strict';

var stormpath = require('../../');
var common = require('../common');
var helpers = require('./helpers');

var assert = common.assert;

describe('OAuthStormpathTokenAuthenticator', function () {
  var account;
  var application;

  beforeEach(function (done) {
    helpers.createApplication(function (err, newApplication) {
      if (err) {
        return done(err);
      }

      application = newApplication;

      application.createAccount(helpers.fakeAccount(), function (err, newAccount) {
        if (err) {
          return done(err);
        }

        account = newAccount;

        done();
      });
    });
  });

  afterEach(function (done) {
    application.delete(done);
  });

  describe('when calling OAuthStormpathTokenAuthenticator(application)', function () {
    var instance;

    beforeEach(function () {
      instance = stormpath.OAuthStormpathTokenAuthenticator(application);
    });

    it('should return a OAuthStormpathTokenAuthenticator instance', function () {
      assert.instanceOf(instance, stormpath.OAuthStormpathTokenAuthenticator);
    });

    it('should return a new instance', function () {
      var differentInstance = new stormpath.OAuthStormpathTokenAuthenticator(application);
      assert.instanceOf(differentInstance, stormpath.OAuthStormpathTokenAuthenticator);
      assert.notEqual(instance, differentInstance);
    });

    it('should return an instance with an application property', function () {
      assert.property(instance, 'application');
      assert.equal(instance.application, application);
    });
  });

  describe('when calling new OAuthStormpathTokenAuthenticator(application)', function () {
    var instance;

    beforeEach(function () {
      instance = new stormpath.OAuthStormpathTokenAuthenticator(application);
    });

    it('should return a OAuthStormpathTokenAuthenticator instance', function () {
      assert.instanceOf(instance, stormpath.OAuthStormpathTokenAuthenticator);
    });

    it('should return a new instance', function () {
      var differentInstance = new stormpath.OAuthStormpathTokenAuthenticator(application);
      assert.instanceOf(differentInstance, stormpath.OAuthStormpathTokenAuthenticator);
      assert.notEqual(instance, differentInstance);
    });

    it('should return an instance with an application property', function () {
      assert.property(instance, 'application');
      assert.equal(instance.application, application);
    });
  });

  describe('when calling authenticate(data, callback)', function () {
    var validToken;
    var invalidToken;
    var authenticator;

    beforeEach(function () {
      authenticator = new stormpath.OAuthStormpathTokenAuthenticator(application);
      validToken = helpers.createStormpathToken(application, account);
      invalidToken = helpers.createStormpathToken(application, account, {
        id: '92d472b3-6eeb-48b8-a342-b2df89c520e8',
        secret: 'bcf251b9-3da8-4020-b4d9-406ee749425d'
      });
    });

    describe('without a data parameter', function () {
      it('should throw an invalid parameter error', function () {
        assert.throws(function () {
          authenticator.authenticate();
        }, 'The \'data\' parameter must be an object.');
      });
    });

    describe('without a callback parameter', function () {
      it('should throw an invalid parameter error', function () {
        assert.throws(function () {
          authenticator.authenticate({});
        }, 'The \'callback\' parameter must be a function.');
      });
    });

    describe('with a stormpath_token data property', function () {
      describe('and the token is invalid', function () {
        it('should fail with a token invalid error', function (done) {
          authenticator.authenticate({ stormpath_token: invalidToken }, function (err, authenticationResult) {
            assert.ok(err);
            assert.equal(err.name, 'ResourceError');
            assert.equal(err.status, 400); // Bad request
            assert.equal(err.code, 10017); // Token is invalid because verifying the signature of a JWT failed.
            assert.equal(err.message, 'HTTP 400, Stormpath 10017 (http://docs.stormpath.com/errors/10017): Token is invalid because verifying the signature of a JWT failed.');
            assert.notOk(authenticationResult);
            done();
          });
        });
      });

      describe('and the token is valid', function () {
        it('should succeed with a OAuthStormpathTokenAuthenticationResult result', function (done) {
          authenticator.authenticate({ stormpath_token: validToken }, function (err, authenticationResult) {
            assert.notOk(err);
            assert.ok(authenticationResult);
            assert.instanceOf(authenticationResult, stormpath.OAuthStormpathTokenAuthenticationResult);
            assert.property(authenticationResult, 'application');
            assert.property(authenticationResult, 'account');
            assert.property(authenticationResult, 'accessToken');
            assert.property(authenticationResult, 'refreshToken');
            done();
          });
        });
      });
    });

    describe('without a stormpath_token data property', function () {
      it('should fail with a token parameter error', function (done) {
        authenticator.authenticate({}, function (err, authenticationResult) {
          assert.ok(err);
          assert.equal(err.name, 'ResourceError');
          assert.equal(err.status, 400); // Bad request
          assert.equal(err.code, 2000); // Property value is required.
          assert.equal(err.message, 'HTTP 400, Stormpath 2000 (http://docs.stormpath.com/errors/2000): token parameter cannot be null, empty, or blank.');
          assert.notOk(authenticationResult);
          done();
        });
      });
    });
  });
});
