'use strict';

var nJwt = require('njwt');
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

  after(function(done){
    helpers.cleanupApplicationAndStores(application, done);
  });

  describe('.build()', function () {
    describe('without options', function () {
      it('should return a valid url', function (done) {
        builder.build(function (err, resultUrl) {
          assert.isNotOk(err);
          assert.isOk(resultUrl);

          var parsedUrl = url.parse(resultUrl, true);

          assert.ok(parsedUrl);
          assert.equal(parsedUrl.pathname, url.parse(application.href).pathname + '/saml/sso/idpRedirect');
          assert.isDefined(parsedUrl.query.accessToken);

          done();
        });
      });
    });
    describe('with options', function () {
      it('should encode those options in the accessToken', function (done) {
        var options = {
          cb_uri: 'http://mysite.com/samlCallback',
          onk: 'my-org',
          ash: 'https://api.stormpath.com/v1/directories/:dirId',
          state: 'hello'
        };
        builder.build(options, function (err, resultUrl) {
          assert.isNull(err);
          assert.isOk(resultUrl);

          var parsedUrl = url.parse(resultUrl, true);

          var secret = application.dataStore.requestExecutor.options.client.apiKey.secret;

          assert.isDefined(parsedUrl.query.accessToken);

          var jwt = nJwt.verify(parsedUrl.query.accessToken, secret);

          assert.equal(jwt.body.cb_uri, options.cb_uri);
          assert.equal(jwt.body.onsk, options.onsk);
          assert.equal(jwt.body.ash, options.ash);
          assert.equal(jwt.body.state, options.state);

          done();
        });
      });
    });
  });
});
