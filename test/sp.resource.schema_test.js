'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var DataStore = require('../lib/ds/DataStore');
var Field = require('../lib/resource/Field');
var Schema = require('../lib/resource/Schema');

describe('Schema Resource', function(){

  describe('getFields()', function(){

    var sandbox;
    var schema;
    var dataStore;

    var mockSchema = {
      href: 'https://api.stormpath.com/v1/schemas/7cvoYkLuGzpnAuVlKQdiDf/',
      fields: {
        href: 'https://api.stormpath.com/v1/schemas/7cvoYkLuGzpnAuVlKQdiDf/fields'
      }
    };

    var mockFieldsResponse = {
      href: 'https://api.stormpath.com/v1/schemas/7dDfMLQmkARN4mQK9MPGIJ/fields',
      offset: 0,
      limit: 25,
      size: 2,
      items: [
        {
          href: 'https://api.stormpath.com/v1/fields/7dDfMOkrekkLhbWBLcGWuN',
          createdAt: '2016-08-02T20:16:21.931Z',
          modifiedAt: '2016-08-02T20:16:21.931Z',
          name: 'givenName',
          required: true,
          schema: {
            href: 'https://api.stormpath.com/v1/schemas/7dDfMLQmkARN4mQK9MPGIJ'
          }
        },
      ]
    };



    before(function(){
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
      sandbox = sinon.sandbox.create();
      schema = new Schema(mockSchema, dataStore);

      sandbox.stub(dataStore.requestExecutor, 'execute', function (req, cb) {
        cb(null, mockFieldsResponse);
      });
    });

    after(function(){
      sandbox.restore();
    });

    it('should return Field instances', function(done){
      schema.getFields(function(err, result){
        assert.equal(result.items, mockFieldsResponse.items);
        assert.instanceOf(mockFieldsResponse.items[0], Field);
        done();
      });
    });
  });
});