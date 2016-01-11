'use strict';

var url = require('url');
var helpers = require('./helpers');
var common = require('../common');

var assert = common.assert;
var stormpath = common.Stormpath;

var SamlIdpUrlBuilder = stormpath.SamlIdpUrlBuilder;

describe('SamlIdpUrlBuilder', function () {
  var builder, application;

  before(function (done) {
    application = helpers.createApplication(function (err, app) {
      if (err) {
        return done(err);
      }

      application = app;
      builder = new SamlIdpUrlBuilder(app);

      done();
    });
  });

  describe('when building', function () {
    describe('with a valid application', function () {
      it('should return a valid url', function (done) {
        builder.build(function (err, resultUrl) {
          assert.isNotOk(err);
          assert.isOk(resultUrl);

          var parsedUrl = url.parse(resultUrl, true);

          assert.ok(parsedUrl);
          assert.equal(parsedUrl.host, 'api.stormpath.com');
          assert.isDefined(parsedUrl.query.accessToken);

          done();
        });
      });
    });
  });
});
