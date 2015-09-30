'use strict';

var assert = require('assert');
var stormpathConfig = require('stormpath-config');
var loader = require('../../lib/configLoader');

function makeTestLoader () {
  return loader({
    skipRemoteConfig: true
  });
}

describe('Config', function() {
  describe('()', function() {
    it('should work with no options supplied', function(done) {
      makeTestLoader().load(function (err, config) {
        if (err) {
          throw err;
        }
        assert(!!config);
        assert(config instanceof stormpathConfig.Config);
        done();
      });
    });

    it('should not require the $HOME environment variable to be set', function (done) {
      var home = process.env.HOME;

      if (home) {
        delete process.env.HOME;
      }

      makeTestLoader().load(function (err, config) {
        if (err) {
          throw err;
        }

        assert(!!config);
        assert(config instanceof stormpathConfig.Config);

        process.env.HOME = home;

        done();
      });
    });

    it('should generate the appropriate apikey options when environment variables are supplied', function (done) {
      var oldApiKeyId = process.env.STORMPATH_CLIENT_APIKEY_ID;
      var oldApiKeySecret = process.env.STORMPATH_CLIENT_APIKEY_SECRET;

      process.env.STORMPATH_CLIENT_APIKEY_ID = 'xxx';
      process.env.STORMPATH_CLIENT_APIKEY_SECRET = 'yyy';

      makeTestLoader().load(function (err, config) {
        if (err) {
          throw err;
        }

        assert.equal(config.client.apiKey.id, 'xxx');
        assert.equal(config.client.apiKey.secret, 'yyy');

        process.env.STORMPATH_CLIENT_APIKEY_ID = oldApiKeyId;
        process.env.STORMPATH_CLIENT_APIKEY_SECRET = oldApiKeySecret;

        done();
      });
    });

    it('should generate the appropriate application options when environment variables are supplied', function(done) {
      process.env.STORMPATH_APPLICATION_HREF = 'https://api.stormpath.com/v1/applications/fake';
      process.env.STORMPATH_APPLICATION_NAME = 'yyy';

      makeTestLoader().load(function (err, config) {
        if (err) {
          throw err;
        }

        assert.equal(config.application.href, 'https://api.stormpath.com/v1/applications/fake');
        assert.equal(config.application.name, 'yyy');

        delete process.env.STORMPATH_APPLICATION_HREF;
        delete process.env.STORMPATH_APPLICATION_NAME;

        done();
      });
    });
  });
});
