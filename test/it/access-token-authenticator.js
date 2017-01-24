var async = require('async');
var nJwt = require('njwt');
var uuid = require('uuid');

var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var stormpath = require('../../');
var StormpathAccessTokenAuthenticationResult = require('../../lib/oauth/stormpath-access-token-authentication-result');

function getAccessTokenOrFail(account, application, done, callback) {
  stormpath.OAuthAuthenticator(application).authenticate({
    body: {
      grant_type: 'password',
      username: account.username,
      password: account.password
    }
  }, function(err, result) {
    if (err) {
      return done(err);
    }

    callback(result.accessTokenResponse.access_token);
  });
}

describe('StormpathAccessTokenAuthenticator', function() {
  var application1, application2;
  var environmentApiKey, environmentClient;
  var newAccount = helpers.fakeAccount();
  var otherApiKey, otherClient;

  before(function(done) {
    async.parallel({
      application: helpers.createApplication.bind(null),
      apiKey: function(next) {
        // Create another API Key in this tenant, so that we can test the ability to
        // validate a token with multiple keys within the same tenant.
        helpers.getClient(function(client) {
          environmentClient = client;
          environmentApiKey = client.config.client.apiKey;

          client.getDirectories({
            name: 'Stormpath Administrators',
            expand: 'accounts'
          }, function(err, collection) {
            if (err) {
              return done(err);
            }

            var href = collection.items[0].accounts.items[0].href + '/apiKeys';

            client.createResource(href, null, function(err, apiKey) {
              if (err) {
                return done(err);
              }

              next(null, apiKey);
            });
          });
        });
      }
    }, function(err, results) {
      if (err) {
        return done(err);
      }

      otherApiKey = results.apiKey;
      application1 = results.application;

      otherClient = new stormpath.Client({
        apiKey: results.apiKey
      });

      async.parallel({
        account: application1.createAccount.bind(application1, newAccount),
        application: helpers.createApplication.bind(null)
      }, function(err, results) {
        if (err) {
          return done(err);
        }

        application2 = results.application;

        done();
      });
    });
  });

  after(function(done) {
    async.parallel([
      helpers.cleanupApplicationAndStores.bind(null, application1),
      helpers.cleanupApplicationAndStores.bind(null, application2),
      otherApiKey.delete.bind(otherApiKey)
    ], done);
  });

  it('should validate tokens that are issued by the current tenant', function(done) {
    // Test that two different keys for the same tenant will yield the same result
    getAccessTokenOrFail(newAccount, application1, done, function(accessToken) {
      var authenticatorA = stormpath.StormpathAccessTokenAuthenticator(environmentClient);
      var authenticatorB = stormpath.StormpathAccessTokenAuthenticator(otherClient);

      async.parallel({
        resultA: authenticatorA.authenticate.bind(authenticatorA, accessToken),
        resultB: authenticatorB.authenticate.bind(authenticatorB, accessToken)
      }, function(err, results) {

        if (err) {
          return done(err);
        }

        assert.instanceOf(results.resultA, StormpathAccessTokenAuthenticationResult);
        assert.instanceOf(results.resultB, StormpathAccessTokenAuthenticationResult);

        done();
      });
    });
  });

  it('should reject tokens that are not signed by a key belonging to the current tenant', function(done) {
    // A token that is not signed by this tenant
    var otherJwt = nJwt.create({
      hello: 'world'
    }, uuid());

    otherJwt.header.kid = 'foo';

    var otherToken = otherJwt.compact();
    var authenticator = stormpath.StormpathAccessTokenAuthenticator(environmentClient);

    authenticator.authenticate(otherToken, function(err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Error while resolving signing key for kid "foo"');
      done();
    });
  });

  it('should reject tokens that try to forge the kid header', function(done) {
    var otherJwt = nJwt.create({
      hello: 'world'
    }, uuid());

    otherJwt.header.kid = environmentApiKey.id;
    var otherToken = otherJwt.compact();

    var authenticator = stormpath.StormpathAccessTokenAuthenticator(environmentClient);

    authenticator.authenticate(otherToken, function(err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Signature verification failed');
      done();
    });
  });

  it('should reject tokens if they are not issued by the expected application', function(done) {
    getAccessTokenOrFail(newAccount, application1, done, function(accessToken) {
      var authenticator = stormpath.StormpathAccessTokenAuthenticator(environmentClient);
      authenticator.forApplication(application2);

      authenticator.authenticate(accessToken, function(err) {
        assert.instanceOf(err, Error);
        assert.equal(err.code, 10014);
        done();
      });
    });
  });

  it('should allow caching for faster authentication', function(done) {
    getAccessTokenOrFail(newAccount, application1, done, function(accessToken) {
      var authenticator = stormpath.StormpathAccessTokenAuthenticator(new stormpath.Client());

      authenticator.withLocalValidation();

      // First attempt with a new client, will take longer due to fetching resources for the first time.
      authenticator.authenticate(accessToken, function(err) {
        if (err) {
          return done(err);
        }

        // Second attempt should come back immediately, because
        // we use a memory cache by default
        var now = new Date().getTime();

        authenticator.authenticate(accessToken, function(err) {
          if (err) {
            return done(err);
          }

          var delta = new Date().getTime() - now;
          assert.isBelow(delta, 10);

          done();
        });
      });
    });
  });
});
