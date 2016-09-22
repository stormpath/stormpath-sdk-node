var common = require('./common');
var _ = common._;

var Tenant = require('../lib/resource/Tenant');
var Account = require('../lib/resource/Account');
var Group = require('../lib/resource/Group');
var CustomData = require('../lib/resource/CustomData');
var CollectionResource = require('../lib/resource/CollectionResource');

var instantiate = require('../lib/resource/ResourceFactory').instantiate;

describe('Resources: ', function () {
  describe('Resource factory -> instantiate', function () {
    describe('if instance constructor can not be a collection', function(){
      function callInstantiateWithWrongCtor(){
        instantiate(CollectionResource);
      }
      it('should throw error', function(){
        callInstantiateWithWrongCtor.should
          .throws(/argument cannot be a CollectionResource/i);
      });
    });

    describe('if data is a collection resource', function(){
      var data;

      before(function () {
        data = {
          href: '',
          items: [
            {
              href: '',
              account: {
                href: ''
              },
              group: {
                href: ''
              },
              customData: {
                href: ''
              }
            },
            {
              href: '',
              account: {
                href: ''
              },
              group: {
                href: ''
              },
              customData: {
                href: ''
              }
            }
          ],
          offset: 0,
          limit: 5
        };
      });

      it('should return collection', function(){
        var coll = instantiate(Tenant, data);

        coll.should.be.an.instanceof(CollectionResource);
        _.each(data.items, function(item){
          item.should.be.an.instanceof(Tenant);
        });
      });

      describe('expand query resource initialization', function() {
        it('should work for one expansion parameter', function() {
          instantiate(Tenant, data, {expand: 'account'});

          _.each(data.items, function(item) {
            item.account.should.be.an.instanceof(Account);
            item.group.should.not.be.an.instanceof(Group);
          });
        });

        it('should work for a comma-delimited list of parameters', function() {
          instantiate(Tenant, data, {expand: 'account,group'});

          _.each(data.items, function(item) {
            item.account.should.be.an.instanceof(Account);
            item.group.should.be.an.instanceof(Group);
          });
        });

        it('should expand the customData field even if not specified in expand (backwards compatibility)', function() {
          instantiate(Tenant, data);

          _.each(data.items, function(item) {
            item.customData.should.be.an.instanceof(CustomData);
          });
        });
      });
    });


    describe('if data is a resource', function(){
      var data;

      before(function () {
        data = {
          href: '',
          account: {
            href: ''
          },
          group: {
            href: ''
          },
          customData: {
            href: ''
          }
        };
      });

      it('should return wrapped obj', function(){
        var coll = instantiate(Tenant, data);

        coll.should.be.an.instanceof(Tenant);
      });

      describe('expand query resource initialization', function() {
        it('should work for one expansion parameter', function() {
          var coll = instantiate(Tenant, data, {expand: 'account'});
          coll.account.should.be.an.instanceof(Account);
          coll.group.should.not.be.an.instanceof(Group);
        });

        it('should work for a comma-delimited list of parameters', function() {
          var coll = instantiate(Tenant, data, {expand: 'account,group'});
          coll.account.should.be.an.instanceof(Account);
          coll.group.should.be.an.instanceof(Group);
        });

        it('should expand the customData field even if not specified in expand (backwards compatibility)', function() {
          var coll = instantiate(Tenant, data);
          coll.customData.should.be.an.instanceof(CustomData);
        });
      });
    });
  });
});
