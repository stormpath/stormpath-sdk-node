
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Tenant = require('../../lib/resource/Tenant');

describe('Tenant', function() {
  var client, tenant;

  this.timeout(60 * 2 * 1000);

  before(function(done) {
    helpers.getClient(function(_client) {
      client = _client;

      client.getCurrentTenant({ name: helpers.uniqId() }, function(err, _tenant) {
        if (err) {
          return done(err);
        }

        tenant = _tenant;
        done();
      });
    });
  });

  it('should be get-able', function() {
    assert.instanceOf(tenant, Tenant);
  });

  describe('getAccounts',function(){
    var directory;
    var accounts;
    var fakeAccount;

    before(function(done){
      accounts = [];
      fakeAccount = helpers.fakeAccount();

      helpers.getClient(function(_client){
        client = _client;
        client.createDirectory(
          {name: helpers.uniqId()},
          function(err, _directory) {
            if (err) {
              return done(err);
            }

            directory = _directory;
            directory.createAccount(
              fakeAccount,
              function(err){
                if (err) {
                  return done(err);
                }

                tenant.getAccounts(function(err,collection){
                  if (err) {
                    return done(err);
                  }
                  collection.each(function(account,next){
                    accounts.push(account);
                    next();
                  },done);
                });
              }
            );
          }
        );
      });
    });

    after(function(done){
      directory.delete(done);
    });

    it('should contain the created account',function(){
      var found = accounts.filter(function(account){
        return account.email === fakeAccount.email;
      });
      assert.equal(found.length,1);
      assert.equal(found[0].email,fakeAccount.email);
    });

  });

  describe('getGroups',function(){
    var directory;
    var groups;
    var groupName;

    before(function(done){
      groups = [];
      groupName = helpers.uniqId();

      helpers.getClient(function(_client){
        client = _client;
        client.createDirectory(
          {name: helpers.uniqId()},
          function(err, _directory) {
            if (err) {
              return done(err);
            }

            directory = _directory;
            directory.createGroup(
              {name: groupName},
              function(err){
                if(err){ return done(err); }
                tenant.getGroups(function(err,collection){
                  if(err){ return done(err); }
                  collection.each(function(group,next){
                    groups.push(group);
                    next();
                  },done);
                });
              }
            );
          }
        );
      });
    });

    after(function(done){
      directory.delete(done);
    });

    it('should contain the created group',function(){
      var found = groups.filter(function(group){
        return group.name === groupName;
      });
      assert.equal(found.length,1);
      assert.equal(found[0].name,groupName);
    });

  });

  describe('custom data',function(){

    describe('via getCustomData',function(){
      var customData;

      before(function(done){
        tenant.getCustomData(function(err,_customData){
        if(err){ return done(err); }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,tenant.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName;
        var propertyValue;

        before(function(done){
          propertyName = helpers.uniqId();
          propertyValue = helpers.uniqId();

          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            tenant.getCustomData(function(err,customData){
              if(err){ throw err; }
              customDataAfterGet = customData;
              done();
            });
          });
        });
        it('should have the new property persisted',function(){
          assert.equal(customDataAfterGet[propertyName],propertyValue);
        });
      });
    });

    describe('via resource expansion',function(){

      function getExpandedTenant(cb){
        client.getCurrentTenant(
          { expand: 'customData' },
          function(err, tenant){
            if(err){ throw err; }
            cb(tenant);
          }
        );
      }

      var customData;

      before(function(done){
        getExpandedTenant(function(tenant){
          customData = tenant.customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,tenant.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName;
        var propertyValue;

        before(function(done){
          propertyName = helpers.uniqId();
          propertyValue = helpers.uniqId();

          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            getExpandedTenant(function(tenant){
              customDataAfterGet = tenant.customData;
              done();
            });
          });
        });
        it('should have the new property persisted',function(){
          assert.equal(customDataAfterGet[propertyName],propertyValue);
        });
      });
    });
  });


});
