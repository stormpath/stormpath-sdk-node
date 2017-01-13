'use strict';

var stormpath = require('../../');
var common = require('../common');
var helpers = require('./helpers');

var assert = common.assert;

describe('OAuthStormpathSocialAuthenticator', function () {
  var application;
  var validProviderId;

  before(function (done) {
    helpers.createApplication(function (err, newApplication) {
      if (err) {
        return done(err);
      }

      application = newApplication;
      validProviderId = 'google';

      helpers.createDirectory({
        provider: {
          providerId: validProviderId,
          clientId: '3f389cd1-9b02-49c3-8a73-735d3e05e369',
          clientSecret: '4064ee95-bf0f-4342-a062-43571d8eb392',
          redirectUri: 'http://decdd275-7f3a-4289-9d41-075295d01451'
        }
      }, function (err, directory) {
        if (err) {
          return done(err);
        }

        application.createAccountStoreMapping({
          accountStore: {
            href: directory.href
          }
        }, done);
      });
    });
  });

  after(function (done) {
    helpers.cleanupApplicationAndStores(application, done);
  });

  describe('inheritance', function() {
    it('should inherit from ScopeFactoryAuthenticator', function() {
      assert.equal(stormpath.OAuthStormpathSocialAuthenticator.super_.name, 'ScopeFactoryAuthenticator');
    });
  });

  describe('when calling OAuthStormpathSocialAuthenticator(application)', function () {
    var instance;

    beforeEach(function () {
      instance = stormpath.OAuthStormpathSocialAuthenticator(application);
    });

    it('should return a OAuthStormpathSocialAuthenticator instance', function () {
      assert.instanceOf(instance, stormpath.OAuthStormpathSocialAuthenticator);
    });

    it('should return a new instance', function () {
      var differentInstance = new stormpath.OAuthStormpathSocialAuthenticator(application);
      assert.instanceOf(differentInstance, stormpath.OAuthStormpathSocialAuthenticator);
      assert.notEqual(instance, differentInstance);
    });

    it('should return an instance with an application property', function () {
      assert.property(instance, 'application');
      assert.equal(instance.application, application);
    });
  });

  describe('when calling new OAuthStormpathSocialAuthenticator(application)', function () {
    var instance;

    beforeEach(function () {
      instance = new stormpath.OAuthStormpathSocialAuthenticator(application);
    });

    it('should return a OAuthStormpathSocialAuthenticator instance', function () {
      assert.instanceOf(instance, stormpath.OAuthStormpathSocialAuthenticator);
    });

    it('should return a new instance', function () {
      var differentInstance = new stormpath.OAuthStormpathSocialAuthenticator(application);
      assert.instanceOf(differentInstance, stormpath.OAuthStormpathSocialAuthenticator);
      assert.notEqual(instance, differentInstance);
    });

    it('should return an instance with an application property', function () {
      assert.property(instance, 'application');
      assert.equal(instance.application, application);
    });
  });

  describe('when calling authenticate(authenticationRequest, callback)', function () {
    var invalidProviderId;
    var authenticator;

    beforeEach(function () {
      invalidProviderId = 'ab369d04-eca4-4d65-8412-a1e61b44d58e';
      authenticator = new stormpath.OAuthStormpathSocialAuthenticator(application);
    });

    describe('without a authenticationRequest parameter', function () {
      it('should throw an invalid parameter error', function () {
        assert.throws(function () {
          authenticator.authenticate();
        }, 'The \'authenticationRequest\' parameter must be an object.');
      });
    });

    describe('without a authenticationRequest.providerId parameter', function () {
      it('should throw an invalid parameter error', function () {
        assert.throws(function () {
          authenticator.authenticate({});
        }, 'The \'authenticationRequest.providerId\' parameter must be a string.');
      });
    });

    describe('without a authenticationRequest.code or a authenticationRequest.accessToken parameter', function () {
      it('should throw an invalid parameter error', function () {
        assert.throws(function () {
          authenticator.authenticate({
            providerId: invalidProviderId
          });
        }, 'One of the parameters \'authenticationRequest.code\' or \'authenticationRequest.accessToken\' must be provided.');
      });
    });

    describe('without a callback parameter', function () {
      var invalidCode;

      beforeEach(function () {
        invalidCode = '87b9760f-eb74-4f17-aa89-b333c7eb51a2';
      });

      it('should throw an invalid parameter error', function () {
        assert.throws(function () {
          authenticator.authenticate({
            providerId: invalidProviderId,
            code: invalidCode
          });
        }, 'The \'callback\' parameter must be a function.');
      });
    });

    describe('with an invalid authenticationRequest.providerId parameter', function () {
      var invalidCode;

      beforeEach(function () {
        invalidCode = '520c541f-bbf2-4075-bc54-148f888d4e95';
      });

      it('should fail with a directory request error', function (done) {
        authenticator.authenticate({
          providerId: invalidProviderId,
          code: invalidCode
        }, function (err, authenticationResult) {
          assert.ok(err);
          assert.equal(err.name, 'ResourceError');
          assert.equal(err.status, 400); // Bad request
          assert.equal(err.code, 5201); // No directory found with this id
          assert.notOk(authenticationResult);
          done();
        });
      });
    });

    describe('with an invalid authenticationRequest.code parameter', function () {
      var invalidCode;

      beforeEach(function () {
        invalidCode = 'd8185a16-4d99-4b04-bd00-fb37cd39dabd';
      });

      it('should fail with a directory request error', function (done) {
        authenticator.authenticate({
          providerId: validProviderId,
          code: invalidCode
        }, function (err, authenticationResult) {
          assert.ok(err);
          assert.equal(err.name, 'ResourceError');
          assert.equal(err.status, 400); // Bad request
          assert.equal(err.code, 7200); // Stormpath was not able to complete the request to the Social Login site.
          assert.notOk(authenticationResult);
          done();
        });
      });
    });

    describe('with an invalid authenticationRequest.accessToken paramter', function () {
      var invalidAccessToken;

      beforeEach(function () {
        invalidAccessToken = '3d0e7394-2896-4c04-9042-9f7adfa48961';
      });

      it('should fail with a directory request error', function (done) {
        authenticator.authenticate({
          providerId: validProviderId,
          accessToken: invalidAccessToken
        }, function (err, authenticationResult) {
          assert.ok(err);
          assert.equal(err.name, 'ResourceError');
          assert.equal(err.status, 400); // Bad request
          assert.equal(err.code, 7200); // Stormpath was not able to complete the request to the Social Login site.
          assert.notOk(authenticationResult);
          done();
        });
      });
    });
  });
});
