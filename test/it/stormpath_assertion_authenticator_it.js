'use strict';

var common = require('../common');
var DataStore = require('../../lib/ds/DataStore');

var jwt = common.jwt;
var sinon = common.sinon;
var assert = common.assert;
var stormpath = common.Stormpath;

var StormpathAssertionAuthenticator = stormpath.StormpathAssertionAuthenticator;
var AssertionAuthenticationResult = stormpath.AssertionAuthenticationResult;

/* jshint -W030 */
describe('StormpathAssertionAuthenticator', function () {
  var secret;
  var sandbox;
  var dataStore;
  var expireAt;
  var errorToken;
  var validToken;
  var mockAccount;

  before(function () {
    secret = '123';

    dataStore = new DataStore({
      client: {
        apiKey: {
          id: 'abc',
          secret: secret
        }
      }
    });

    sandbox = sinon.sandbox.create();

    expireAt = new Date().getTime() + (60 * 60 * 1);
    mockAccount = { href: 'http://stormpath.mock/api/v1/account/123' };

    sandbox.stub(dataStore, 'getResource', function (href, data, callback) {
      callback(null, mockAccount);
    });

    errorToken = jwt.create({ err: 'Error message from Stormpath API' }, secret)
      .setExpiration(expireAt)
      .compact();

    validToken = jwt.create({ sub: mockAccount.href }, secret)
      .setExpiration(expireAt)
      .compact();
  });

  after(function () {
    sandbox.restore();
  });

  describe('authenticator', function () {
    var application;
    var authenticator;

    before(function () {
      application = { dataStore: dataStore };
      authenticator = new StormpathAssertionAuthenticator(application);
    });

    describe('when created', function () {
      it('returns a StormpathAssertionAuthenticator instance', function () {
        assert.instanceOf(authenticator, StormpathAssertionAuthenticator);
      });

      it('creates a new object', function () {
        var otherAuthenticator = new StormpathAssertionAuthenticator(application);
        assert.ok(authenticator);
        assert.notEqual(authenticator, otherAuthenticator);
      });
    });

    describe('when authenticating', function () {
      it('fails when passed an invalid jwt', function (done) {
        authenticator.authenticate('invalid-jwt', function (err, result) {
          assert.isOk(err);
          assert.isUndefined(result);
          assert.equal(err.message, 'Jwt cannot be parsed');
          assert.equal(err.statusCode, 401);
          done();
        });
      });

      it('succeeds when passed a valid token without an account href (sub)', function (done) {
        var validEmptyToken = jwt.create({}, secret)
          .setExpiration(expireAt)
          .compact();

        authenticator.authenticate(validEmptyToken, function (err, result) {
          assert.isNotOk(err);
          assert.isOk(result);
          assert.isNull(result.account);
          done();
        });
      });

      it('returns an error if the JWT contains an error', function (done) {
        authenticator.authenticate(errorToken, function (err, result) {
          assert.isOk(err);
          assert.isNotOk(result);
          assert.equal(err.message, errorToken.err);
          done();
        });
      });

      it('succeeds when passed a valid token', function (done) {
        authenticator.authenticate(validToken, function (err, result) {
          assert.isNotOk(err);
          assert.isOk(result);
          assert.instanceOf(result, AssertionAuthenticationResult);
          assert.equal(result.stormpath_token, validToken);
          assert.isOk(result.expandedJwt);
          assert.equal(result.expandedJwt.body.sub, mockAccount.href);
          done();
        });
      });
    });
  });
});
