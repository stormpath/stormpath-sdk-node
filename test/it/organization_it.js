
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;
var async = require('async');

var Organization = require('../../lib/resource/Organization');
var OrganizationAccountStoreMapping = require('../../lib/resource/OrganizationAccountStoreMapping');

describe('Organization',function(){

  var client, organization, directory, mapping;

  before(function(done) {
    helpers.getClient(function(_client) {
      client = _client;
      var org = {
        name: helpers.uniqId(),
        nameKey: helpers.uniqId()
      };
      var dir = {
        name: helpers.uniqId()
      };
      client.createOrganization(org, function(err, _organization) {
        if(err){ throw err; }
        organization = _organization;

        client.createDirectory(dir,function(err,_directory){
          if(err){ throw err; }
          directory = _directory;
          done();
        });


      });
    });
  });

  after(function(done) {
    async.eachSeries([mapping,directory, organization ], function(resource, next) {
      resource.delete(next);
    }, done);
  });

  describe('createAccountStoreMapping',function(){
    after(function(done){
      mapping.delete(done);
    });
    it('should create an OrganizationAccountStoreMapping',function(done){
      organization.createAccountStoreMapping({accountStore:directory},function(err,_mapping){
        mapping = _mapping;
        assert(_mapping instanceof OrganizationAccountStoreMapping);
        done();
      });
    });
    it('should handle errors',function(done){
      organization.createAccountStoreMapping({accountStore:{href:'not found'}},function(err){
        assert(err.status === 400);
        assert(err.code === 2002);
        done();
      });
    });
  });

  describe('getOrganization',function(){
    after(function(done){
      mapping.delete(done);
    });
    it('should return the organization',function(done){
      mapping.getOrganization(function(err,organization){
        assert(organization instanceof Organization);
        done();
      });
    });
  });

  describe('createAccountStoreMappings',function(){
    it('should create an OrganizationAccountStoreMapping',function(done){
      organization.createAccountStoreMappings([{accountStore:directory}],function(err,results){
        if(err){
          done(err);
        }else{
          assert(results[0] instanceof OrganizationAccountStoreMapping);
          mapping = results[0];
          done();
        }
      });
    });
  });

  describe('getAccountStoreMappings',function(){
    it('should get an OrganizationAccountStoreMapping',function(done){
      organization.getAccountStoreMappings(function(err,collection){
        assert(collection.items[0] instanceof OrganizationAccountStoreMapping);
        done();
      });
    });
  });

});
