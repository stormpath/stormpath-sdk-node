var common = require('./common');
var _ = common._;

var Tenant = require('../lib/resource/Tenant');
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
      var data = {
        href:'',
        items:[{href:''},{href:''}],
        offset: 0,
        limit: 5
      };

      it('should return collection', function(){
        var coll = instantiate(Tenant, data);

        coll.should.be.an.instanceof(CollectionResource);
        _.each(data.items, function(item){
          item.should.be.an.instanceof(Tenant);
        });
      });
    });

    describe('if data is a resource', function(){
      var data = {href: ''};
      it('should return wrapped obj', function(){
        var coll = instantiate(Tenant, data);

        coll.should.be.an.instanceof(Tenant);
      });
    });
  });
});
