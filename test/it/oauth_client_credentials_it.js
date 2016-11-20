var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;
var sinon = common.sinon;

var njwt = require('njwt');

var stormpath = require('../../');

var Account = require('../../lib/resource/Account');
var AccessToken = require('../../lib/resource/AccessToken');
var JwtAuthenticator = require('../../lib/jwt/jwt-authenticator');
var JwtAuthenticationResult = require('../../lib/jwt/jwt-authentication-result');

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

  describe('inheritance', function() {
    it('should inherit from ScopeFactoryAuthenticator', function() {
      assert.equal(stormpath.OAuthClientCredentialsAuthenticator.super_.name, 'ScopeFactoryAuthenticator');
    });
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

    describe('scope factory properties', function() {
      var scopeFactoryFunction;
      var scope;
      var signingKey;

      before(function() {
        scopeFactoryFunction = sinon.spy(function(authenticationResult, requestedScope, callback) {
          assert.instanceOf(authenticationResult, JwtAuthenticationResult);
          callback(null, scope);
        });

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
        auth.authenticate({apiKey: apiKey, scope: scope}, function(err, result) {
          if (err) {
            return done(err);
          }

          /* jshint -W030 */
          scopeFactoryFunction.should.have.been.calledOnce;
          /* jshint +W030 */
          scopeFactoryFunction.args[0][1].should.equal(scope);
          assert.ok(result);
          done();
        });
      });

      it('should append a scope field from the factory to the result token, if the factory result is a truthy string', function(done) {
        auth.authenticate({apiKey: apiKey, scope: scope}, function(err, result) {
          if (err) {
            return done(err);
          }

          /* jshint -W030 */
          scopeFactoryFunction.should.have.been.calledTwice;
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

        auth.authenticate({apiKey: apiKey, scope: scope}, function(err, authResponse) {
          if (err) {
            return done(err);
          }

          /* jshint -W030 */
          scopeFactoryFunction.should.have.been.calledThrice;
          /* jshint +W030 */

          var originalToken = scopeFactoryFunction.args[2][0].accessToken;
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
        var authenticator;
        var token;

        before(function(done) {
          authenticator = new JwtAuthenticator(application);
          auth.authenticate({apiKey: apiKey, scope: scope}, function(err, resp) {
            if (err) {
              return done(err);
            }
            token = resp.accessTokenResponse.access_token;
            done();
          });
        });

        describe('without local validation', function() {
          it('should validate the token', function(done) {
            authenticator.authenticate(token, function(err, data) {
              assert.notOk(err);
              assert.ok(data);
              done();
            });
          });

          it('should yield a result containing the scope', function(done) {
            authenticator.authenticate(token, function(err, data) {
              assert.ok(data.expandedJwt);
              assert.ok(data.expandedJwt.claims);
              assert.equal(data.expandedJwt.claims.scope, scope);
              done();
            });
          });
        });

        describe('with local validation', function() {
          before(function() {
            authenticator.withLocalValidation();
          });

          it('should validate the token', function(done) {
            authenticator.authenticate(token, function(err, data) {
              assert.notOk(err);
              assert.ok(data);
              done();
            });
          });

          it('should yield a result containing the scope', function(done) {
            authenticator.authenticate(token, function(err, data) {
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

          auth.authenticate({apiKey: apiKey, scope: scope}, callback);
        });
      });
    });

    describe('returned OAuthClientCredentialsAuthenticationResult', function() {
      var authResult;

      beforeEach(function(done) {
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

      it('should fetch the correct Account via #getAccount', function(done) {
        var getAccountCallback = function(err, accountResponse) {
          if (err) {
            return done(err);
          }

          assert.notOk(err);
          assert.ok(accountResponse);
          assert.instanceOf(accountResponse, Account);
          assert.deepEqual(accountResponse, account);
          done();
        };

        assert.property(authResult, 'getAccount');
        authResult.getAccount(getAccountCallback);
      });

      it('should fetch an AccessToken via #getAccessToken', function(done) {
        var getAccessTokenCallback = function(err, accessToken) {
          if (err) {
            return done(err);
          }

          assert.notOk(err);
          assert.ok(accessToken);
          assert.instanceOf(accessToken, AccessToken);
          done();
        };

        assert.property(authResult, 'getAccessToken');
        authResult.getAccessToken(getAccessTokenCallback);
      });
    });

  });
});
