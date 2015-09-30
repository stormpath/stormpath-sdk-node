'use strict';

var assert = require('assert');

var async = require('async');
var uuid = require('uuid');

var common = require('../common');
var stormpath = common.Stormpath;
var helpers = require('./helpers');

var Organization = require('../../lib/resource/Organization');

describe('Client', function() {
  var organization;
  describe('creation', function() {
    var createClientFn;

    before(function(done) {
      helpers.loadApiKey(function(apiKey) {
        createClientFn = function createClientFn() {
          new stormpath.Client({ apiKey:apiKey });
        };
        done();
      });
    });

    //it('should not expose an apiKey property', function(done) {
    //  helpers.getClient(function(client) {
    //    assert.equal(client.config.apiKey, undefined);
    //    done();
    //  });
    //});

    //it('should automatically load client.config.apiKey', function(done) {
    //  helpers.getClient(function(client) {
    //    assert(client.config.client.apiKey);
    //    done();
    //  });
    //});

    it('shoud propertly load socialProviders onto the configuration object', function(done) {
      helpers.getClient(function(client) {
        var applicationData = { name: uuid.v4() };
        var application, directory;

        async.series([
          // First, we'll create a new Stormpath Application.
          function(cb) {
            client.createApplication(applicationData, { createDirectory: true }, function(err, app) {
              if (err) {
                return cb(err);
              }

              // Update the Client config, so that when we move onto the mapping
              // step we'll be able to merge in the config!
              client.config.application = {
                href: app.href
              };

              application = app;
              cb();
            });
          },

          // Next, we'll create a Facebook Directory.
          function(cb) {
            var directoryData = {
              name: uuid.v4(),
              provider: {
                clientId: 'xxx',
                clientSecret: 'yyy',
                providerId: 'facebook'
              }
            };

            client.createDirectory(directoryData, function(err, dir) {
              if (err) {
                return cb(err);
              }

              directory = dir;
              cb();
            });
          },

          // Finally, we'll map our newly created Directory to our Application.
          function(cb) {
            var mappingData = {
              application: {
                href: application.href
              },
              accountStore: {
                href: directory.href
              },
              isDefaultAccountStore: false,
              isDefaultGroupStore: false
            };

            application.createAccountStoreMapping(mappingData, function(err) {
              if (err) {
                return cb(err);
              }

              cb();
            });
          }
        ], function(err) {
          if (err) {
            return done(err);
          }

          // Now, we'll run our actual Client.mergeRemoteConfig method to
          // attempt to grab all social providers.
          client.mergeRemoteConfig(function(err) {
            if (err) {
              return done(err);
            }

            assert.equal(client.config.socialProviders.facebook.providerId, 'facebook');
            assert.equal(client.config.socialProviders.facebook.clientId, 'xxx');
            assert.equal(client.config.socialProviders.facebook.clientSecret, 'yyy');
            done();
          });
        });
      });
    });

    it('should not throw', function() {
      assert.doesNotThrow(createClientFn);
    });
  });

  describe('getAccessToken',function(){
    var AccountAccessTokenFixture = require('../fixtures/account-token');
    var accountCase = new AccountAccessTokenFixture();

    before(function(done) {
      accountCase.before(done);
    });

    after(function(done) {
      accountCase.after(done);
    });

    it('should get an access token resource',function(done){
      accountCase.client.getAccessToken(accountCase.passwordGrantResult.stormpathAccessTokenHref,function(err,resource){
        if(err){
          done(err);
        }else{
          assert(resource instanceof require('../../lib/resource/AccessToken'));
          done();
        }
      });
    });
  });

  describe('getCurrentTenant', function() {
    var Tenant = require('../../lib/resource/Tenant');

    it('should not err', function(done) {
      helpers.getClient(function(client) {
        client.getCurrentTenant(function(err) {
          assert.ifError(err);
          done();
        });
      });
    });

    it('should return a tenant instance', function(done) {
      helpers.getClient(function(client) {
        client.getCurrentTenant(function(err, tenant) {
          assert.ifError(err);
          assert(tenant instanceof Tenant);
          done();
        });
      });
    });
  });

  describe('createOrganization',function(){
    var client;
    before(function(done){
      helpers.getClient(function(_client){
        client = _client;
        done();
      });
    });
    it('should create an organization',function(done){
      client.createOrganization({
        name: uuid(),
        nameKey: uuid()
      },function(err,_organization){
        assert(_organization instanceof Organization);
        organization = _organization;
        done();
      });
    });
    it('should handle errors',function(done){
      client.createOrganization({
        name: uuid()
      },function(err){
        assert(err.userMessage.match(/Organization nameKey cannot be null/));
        done();
      });
    });
  });

  describe('getOrganization',function(){
    var client;
    before(function(done){
      helpers.getClient(function(_client){
        client = _client;
        done();
      });
    });
    it('should get an organization',function(done){
      client.getOrganization(organization.href,function(err,organization){
        assert(organization instanceof Organization);
        done();
      });
    });
    it('should handle errors',function(done){
      client.getOrganization('bad href',function(err){
        assert(err.status === 404);
        done();
      });
    });
  });

  describe('getOrganizations',function(){
    var client;
    before(function(done){
      helpers.getClient(function(_client){
        client = _client;
        done();
      });
    });
    it('should get an organization',function(done){
      client.getOrganizations(function(err,collection){
        assert(collection.items[0] instanceof Organization);
        done();
      });
    });
  });
});
