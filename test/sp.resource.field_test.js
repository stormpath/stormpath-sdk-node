'use strict';

var common = require('./common');
var sinon = common.sinon;

var DataStore = require('../lib/ds/DataStore');
var Field = require('../lib/resource/Field');

describe('Field Resource', function () {
  describe('save()', function () {
    var sandbox;
    var field;
    var dataStore;
    var requestExecutorStub;

    var mockField = {
      href: 'https://api.stormpath.com/v1/fields/7dDfMOkrekkLhbWBLcGWuN',
      createdAt: '2016-08-02T20:16:21.931Z',
      modifiedAt: '2016-08-02T20:16:21.931Z',
      name: 'givenName',
      required: true,
      schema: {
        href: 'https://api.stormpath.com/v1/schemas/7dDfMLQmkARN4mQK9MPGIJ'
      }
    };

    before(function () {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
      sandbox = sinon.sandbox.create();
      field = new Field(mockField, dataStore);
      requestExecutorStub = sandbox.stub(dataStore.requestExecutor, 'execute');
    });

    after(function () {
      sandbox.restore();
    });

    it('should post the resource to the REST API', function () {
      field.save();
      requestExecutorStub.should.have.been.calledWith({
        body: mockField,
        uri: mockField.href,
        method: 'POST'
      });
    });
  });
});