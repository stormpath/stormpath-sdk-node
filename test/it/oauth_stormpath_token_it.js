'use strict';

var stormpath = require('../../');
var common = require('../common');
var helpers = require('./helpers');

var assert = common.assert;
var sinon = common.sinon;

var njwt = require('njwt');

var JwtAuthenticator = require('../../lib/jwt/jwt-authenticator');
var JwtAuthenticationResult = require('../../lib/jwt/jwt-authentication-result');

describe('OAuthStormpathTokenAuthenticator', function () {
  var account;
  var application;

  before(function (done) {
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

  after(function (done) {
    helpers.cleanupApplicationAndStores(application, done);
  });

  describe('inheritance', function() {
    it('should inherit from ScopeFactoryAuthenticator', function() {
      assert.equal(stormpath.OAuthStormpathTokenAuthenticator.super_.name, 'ScopeFactoryAuthenticator');
    });
  });

  describe('when calling OAuthStormpathTokenAuthenticator(application)', function () {
    var instance;

    beforeEach(function () {
      instance = stormpath.OAuthStormpathTokenAuthenticator(application);
    });

    it('should return a OAuthStormpathTokenAuthenticator instance', function () {
      assert.instanceOf(instance, stormpath.OAuthStormpathTokenAuthenticator);
    });

    describe('inheritance', function() {
      it('should inherit from ScopeFactoryAuthenticator', function() {
        assert.equal(stormpath.OAuthStormpathTokenAuthenticator.super_.name, 'ScopeFactoryAuthenticator');
      });
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

    beforeEach(function (done) {
      authenticator = new stormpath.OAuthStormpathTokenAuthenticator(application);
      validToken = helpers.createStormpathToken(application, account);
      invalidToken = helpers.createStormpathToken(application, account, {
        id: '92d472b3-6eeb-48b8-a342-b2df89c520e8',
        secret: 'bcf251b9-3da8-4020-b4d9-406ee749425d'
      });
      /*
        If the assertions run too quickly, the iat of the token will be in the
        future and this will cause an iat validation error.
       */
      setTimeout(done,1000);
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
            assert.equal(err.developerMessage, 'Token is invalid because verifying the signature of a JWT failed.');
            assert.notOk(authenticationResult);
            done();
          });
        });
      });

      describe('and the token is valid', function () {
        it('should succeed with a OAuthStormpathTokenAuthenticationResult result', function (done) {
          authenticator.authenticate({ stormpath_token: validToken }, function (err, authenticationResult) {
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
        authenticator.authenticate({}, function (err, authenticationResult) {
          assert.ok(err);
          assert.equal(err.name, 'ResourceError');
          assert.equal(err.status, 400); // Bad request
          assert.equal(err.code, 2000); // Property value is required.
          assert.equal(err.developerMessage, 'token parameter is required; it cannot be null, empty, or blank.');
          assert.notOk(authenticationResult);
          done();
        });
      });
    });

    describe('scope factory properties', function() {
      var auth;
      var spy;
      var scopeFactoryFunction;
      var scope;
      var signingKey;

      before(function() {
        auth = new stormpath.OAuthStormpathTokenAuthenticator(application);
        spy = sinon.spy();
        scopeFactoryFunction = function scopeFactoryFunction(authenticationResult, requestedScope, callback) {
          assert.instanceOf(authenticationResult, JwtAuthenticationResult);
          spy(authenticationResult, requestedScope, callback);
          callback(null, scope);
        };

        scope = 'test';
        signingKey = application.dataStore.requestExecutor.options.client.apiKey.secret;

        auth.setScopeFactory(scopeFactoryFunction);
        auth.setScopeFactorySigningKey(signingKey);
      });

      after(function() {
        // Unset the scope factory props
        auth.setScopeFactory();
        auth.setScopeFactorySigningKey();
      });

      it('should call the scope factory function if the scope is defined, with the correct `requestedScope`', function(done) {
        auth.authenticate({stormpath_token: validToken, scope: scope}, function(err, result) {
          if (err) {
            return done(err);
          }

          /* jshint -W030 */
          spy.should.have.been.calledOnce;
          /* jshint +W030 */
          spy.args[0][1].should.equal(scope);
          assert.ok(result);
          done();
        });
      });

      it('should append a scope field from the factory to the result token, if the factory result is a truthy string', function(done) {
        auth.authenticate({stormpath_token: validToken, scope: scope}, function(err, result) {
          if (err) {
            return done(err);
          }

          /* jshint -W030 */
          spy.should.have.been.calledTwice;
          /* jshint +W030 */

          // Decoded token
          assert.ok(result);
          assert.ok(result.accessToken);
          assert.ok(result.accessToken.body);
          assert.equal(result.accessToken.body.scope, scope);

          // Manual decoding check
          njwt.verify(result.accessTokenResponse.access_token, signingKey, function(err, token) {
            assert.ok(token);
            assert.ok(token.body);
            assert.equal(token.body.scope, scope);
            done();
          });
        });
      });

      it('should leave all the other fields in the header and body of the JWT untouched', function(done) {
        var bodyField;

        auth.authenticate({stormpath_token: validToken, scope: scope}, function(err, authResponse) {
          if (err) {
            return done(err);
          }

          /* jshint -W030 */
          spy.should.have.been.calledThrice;
          /* jshint +W030 */

          var originalToken = spy.args[2][0].accessToken;
          var token = authResponse.accessToken;

          assert.deepEqual(originalToken.header, token.header);

          for (bodyField in originalToken.body) {
            if (originalToken.body.hasOwnProperty(bodyField)) {
              assert.equal(originalToken.body[bodyField], token.body[bodyField]);
            }
          }

          done();
        });
      });

      describe('JwtAuthenticator validation', function() {
        var jwtAuthenticator;
        var token;

        before(function(done) {
          jwtAuthenticator = new JwtAuthenticator(application);
          auth.authenticate({stormpath_token: validToken, scope: scope}, function(err, resp) {
            if (err) {
              return done(err);
            }
            token = resp.accessTokenResponse.access_token;
            done();
          });
        });

        describe('without local validation', function() {
          it('should validate the token', function(done) {
            jwtAuthenticator.authenticate(token, function(err, data) {
              assert.notOk(err);
              assert.ok(data);
              done();
            });
          });

          it('should yield a result containing the scope', function(done) {
            jwtAuthenticator.authenticate(token, function(err, data) {
              assert.ok(data.expandedJwt);
              assert.ok(data.expandedJwt.claims);
              assert.equal(data.expandedJwt.claims.scope, scope);
              done();
            });
          });
        });

        describe('with local validation', function() {
          before(function() {
            jwtAuthenticator.withLocalValidation();
          });

          it('should validate the token', function(done) {
            jwtAuthenticator.authenticate(token, function(err, data) {
              assert.notOk(err);
              assert.ok(data);
              done();
            });
          });

          it('should yield a result containing the scope', function(done) {
            jwtAuthenticator.authenticate(token, function(err, data) {
              assert.ok(data.expandedJwt);
              assert.ok(data.expandedJwt.claims);
              assert.equal(data.expandedJwt.claims.scope, scope);
              done();
            });
          });
        });
      });

      describe('errors', function() {

        before(function() {
          auth.setScopeFactorySigningKey();
        });

        after(function() {
          auth.setScopeFactorySigningKey(signingKey);
        });

        it('should call the callback with an error if used with a factory function but without a key', function(done) {
          var callback = function(err, data) {
            assert.ok(err);
            assert.notOk(data);
            done();
          };

          auth.authenticate({stormpath_token: validToken, scope: scope}, callback);
        });
      });
    });
  });
});
