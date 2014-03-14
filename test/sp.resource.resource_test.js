var common = require('./common');
var _ = common._;
var should = common.should;

var Resource = require('../lib/resource/Resource');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('Resource base class', function () {
    describe('constructor', function () {
      var apiKey = {id:'id', secret:'secret'};
      describe('if called with 2 params', function () {
        var resource, ds;
        var obj = {data: 'boom!', data2: 'boom2!'};
        before(function () {
          ds = new DataStore({apiKey:apiKey});
          resource = new Resource(obj, ds);
        });

        it('should copy all fields from data', function () {
          _.each(obj, function (val, key) {
            resource[key].should.be.equal(val);
          });
        });
        it('should persist data store instance', function () {
          resource.dataStore.should.be.an.instanceof(DataStore);
          resource.dataStore.should.be.equal(ds);
        });
      });

      describe('if called only with data param', function () {
        var resource;
        var obj = {data: 'boom!', data2: 'boom2!'};
        before(function () {
          resource = new Resource(obj);
        });

        it('should copy all fields from data param', function () {
          _.each(obj, function (val, key) {
            resource[key].should.be.equal(val);
          });
        });
        it('should leave dataStore empty', function(){
          should.not.exist(resource.dataStore);
        });
      });

      describe('if called only with data store param', function () {
        var resource, ds;
        var hack = 'boom!';
        before(function () {
          ds = new DataStore({apiKey:apiKey});
          ds.hack = hack;

          resource = new Resource(ds);
        });

        it('should not copy any fields from data param', function(){
          should.not.exist(resource.hack);
        });
        it('should persist data store instance', function(){
          resource.dataStore.should.be.an.instanceof(DataStore);
          resource.dataStore.should.be.equal(ds);
        });
      });
    });
  });
});