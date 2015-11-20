'use strict';

var assert = require('assert');

var uuid = require('uuid');

var common = require('../common');
var stormpath = common.Stormpath;
var helpers = require('./helpers');

var Organization = require('../../lib/resource/Organization');

describe('Client', function() {
  var organization;

  describe('creation', function() {
    it('should not throw', function(done) {
      assert.doesNotThrow(function () {
        var client = new stormpath.Client();

        client.on('error', function (err) {
          throw err;
        });

        client.on('ready', function () {
          done();
        });
      });
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
      accountCase.client.getAccessToken('/accessTokens/' + accountCase.passwordGrantResult.accessToken.body.jti, function(err,resource){
        if(err){
          done(err);
        }else{
          assert(resource instanceof require('../../lib/resource/AccessToken'));
          done();
        }
      });
    });
  });

  describe('getRefreshToken',function(){
    var AccountRefreshTokenFixture = require('../fixtures/account-token');
    var accountCase = new AccountRefreshTokenFixture();

    before(function(done) {
      accountCase.before(done);
    });

    after(function(done) {
      accountCase.after(done);
    });

    it('should get a refresh token resource',function(done){
      accountCase.client.getRefreshToken('/refreshTokens/' + accountCase.passwordGrantResult.refreshToken.body.jti, function(err,resource){
        if(err){
          done(err);
        }else{
          assert(resource instanceof require('../../lib/resource/RefreshToken'));
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
