'use strict';

var common = require('../common');
var DataStore = require('../../lib/ds/DataStore');

var jwt = common.jwt;
var assert = common.assert;
var stormpath = common.Stormpath;

var StormpathAssertionAuthenticator = stormpath.StormpathAssertionAuthenticator;
var AssertionAuthenticationResult = stormpath.AssertionAuthenticationResult;

describe('StormpathAssertionAuthenticator', function () {
  var secret;
  var application;
  var authenticator;

  before(function () {
    secret = '123';
    application = {};

    application.dataStore = new DataStore({
      client: {
        apiKey: {
          id: 'abc',
          secret: secret
        }
      }
    });

    authenticator = new StormpathAssertionAuthenticator(application);
  });

  describe('when new is called', function () {
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

    it('fails when valid jwt is passed but missing account href (sub)', function (done) {
      var expireAt = new Date().getTime() + (60 * 60 * 1);

      var validToken = jwt.create({}, secret)
        .setExpiration(expireAt)
        .compact();

      authenticator.authenticate(validToken, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        assert.equal(err.message, 'Stormpath Account HREF (sub) in JWT not provided.');
        done();
      });
    });

    it('succeeds when passed a valid jwt', function (done) {
      var expireAt = new Date().getTime() + (60 * 60 * 1);
      var fakeAccountHref = 'http://stormpath.fake/api/v1/account/123';

      var validToken = jwt.create({sub: fakeAccountHref}, secret)
        .setExpiration(expireAt)
        .compact();

      authenticator.authenticate(validToken, function (err, result) {
        assert.isNotOk(err);
        assert.isOk(result);
        assert.instanceOf(result, AssertionAuthenticationResult);
        assert.equal(result.jwt, validToken);
        assert.isOk(result.expandedJwt);
        assert.equal(result.expandedJwt.body.sub, fakeAccountHref);
        done();
      });
    });
  });
});
