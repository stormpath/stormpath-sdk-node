
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;
var sinon = common.sinon;

var njwt = require('njwt');

var stormpath = require('../../');

var JwtAuthenticator = require('../../lib/jwt/jwt-authenticator');
var JwtAuthenticationResult = require('../../lib/jwt/jwt-authentication-result');

describe('OAuthPasswordGrantRequestAuthenticator',function(){

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

  describe('inheritance', function() {
    it('should inherit from ScopeFactoryAuthenticator', function() {
      assert.equal(stormpath.OAuthPasswordGrantRequestAuthenticator.super_.name, 'ScopeFactoryAuthenticator');
    });
  });

  it('should be constructable with new operator',function(){
    var authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.OAuthPasswordGrantRequestAuthenticator);
  });

  it('should be constructable without new operator',function(){
    var authenticator = stormpath.OAuthPasswordGrantRequestAuthenticator(application);
    assert.instanceOf(authenticator,stormpath.OAuthPasswordGrantRequestAuthenticator);
  });

  it('should create access tokens',function(done){
    var authenticator = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
    authenticator.authenticate({
      username: newAccount.username,
      password: newAccount.password
    },common.assertPasswordGrantResponse(done));
  });

  describe('calling the #authenticate(data, callback) method', function() {
    var auth;
    var scope;
    var requestData;

    before(function() {
      auth = new stormpath.OAuthPasswordGrantRequestAuthenticator(application);
      scope = 'test';
      requestData = {
        username: newAccount.username,
        password: newAccount.password,
        scope: scope
      };
    });

    describe('scope factory properties', function() {
      var scopeFactoryFunction;
      var signingKey;

      before(function() {
        scopeFactoryFunction = sinon.spy(function(authenticationResult, requestedScope, callback) {
          assert.instanceOf(authenticationResult, JwtAuthenticationResult);
          callback(null, scope);
        });

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
        auth.authenticate(requestData, function(err, result) {
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
        auth.authenticate(requestData, function(err, result) {
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

        auth.authenticate(requestData, function(err, authResponse) {
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
          auth.authenticate(requestData, function(err, resp) {
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

          auth.authenticate(requestData, callback);
        });
      });
    });
  });
});
