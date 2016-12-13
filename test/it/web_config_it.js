'use strict';

var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var WebConfig = require('../../lib/resource/WebConfig');

describe('WebConfig', function() {
  var client;
  var app;
  var webConfig;
  var signingKey;

  before(function(done) {
    helpers.getClient(function(_client) {
      client = _client;
      signingKey = client._dataStore.requestExecutor.options.client.apiKey.secret;

      client.createApplication({ name: helpers.uniqId()}, function(err, _app) {
        if (err) {
          return done(err);
        }

        app = _app;
        app.getWebConfig(function(err, _webConfig) {
          if (err) {
            return done(err);
          }

          webConfig = _webConfig;
          done();
        });
      });
    });
  });

  after(function(done) {
    app.delete(function(err) {
      if (err) {
        return done(err);
      }

      done();
    });
  });

  it('should be get-able', function() {
    assert.instanceOf(webConfig, WebConfig);
  });

  it('should have the application uri', function() {
    assert.isOk(webConfig.dnsLabel);
  });

  it('should be possible to enable it', function(done) {
    webConfig.status = 'ENABLED';

    webConfig.save(function(err, _webConfig) {
      if (err) {
        return done(err);
      }

      assert.equal(_webConfig.status, 'ENABLED');
      done();
    });
  });

  it('should be possible to disable it', function(done) {
    webConfig.status = 'DISABLED';

    webConfig.save(function(err, _webConfig) {
      if (err) {
        return done(err);
      }

      assert.equal(_webConfig.status, 'DISABLED');
      done();
    });
  });

  it('should be possible to edit it', function(done) {
    var oldRegisterStatus = webConfig.register.enabled;
    var newRegisterStatus = !oldRegisterStatus;

    webConfig.register.enabled = newRegisterStatus;

    webConfig.save(function(err, _webConfig) {
      if (err) {
        return done(err);
      }

      assert.equal(_webConfig.register.enabled, newRegisterStatus);
      done();
    });
  });
});