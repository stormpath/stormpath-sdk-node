'use strict';

var common = require('../common');
var DataStore = require('../../lib/ds/DataStore');

var assert = common.assert;
var sinon = common.sinon;
var stormpath = common.Stormpath;

var AssertionAuthenticationResult = stormpath.AssertionAuthenticationResult;

describe('AssertionAuthenticationResult', function () {

  var authenticationResult;
  var sandbox;
  var dataStore;

  var mockAccount = {
    href: 'http://stormpath.mock/api/v1/account/123',
    name: 'foo'
  };

  before(function () {

    dataStore = new DataStore({
      client: {
        apiKey: {
          id: 'abc',
          secret: '123'
        }
      }
    });

    sandbox = sinon.sandbox.create();

    var data = {
      account: {
        href: mockAccount.href
      },
      dataStore: {
        foo: 'this dataStore propety should be ignored, as it will already be defined by the first dataStore parmater'
      }
    };

    authenticationResult = new AssertionAuthenticationResult(dataStore, data);

    sandbox.stub(dataStore, 'getResource', function (href, data, callback) {
      callback(null, mockAccount);
    });
  });

  after(function () {
    sandbox.restore();
  });

  describe('when constructed', function () {

    it('should apply the data store parmater to the object', function(){
      assert.equal(authenticationResult.dataStore, dataStore);
    });

    it('should apply the data parmater properties to the object', function(){
      assert.ok(authenticationResult.account);
      assert.equal(authenticationResult.account.href, mockAccount.href);
    });
  });

  describe('.getAccount()', function () {

    it('should error if no account is defined', function(done) {
      new AssertionAuthenticationResult({},{}).getAccount(function(err){
        assert.isOk(err);
        assert.equal(err.message, 'Unable to get account. Account HREF not specified.');
        done();
      });
    });

    it('should call the callback with the account result', function (done) {
      authenticationResult.getAccount(function (err, result) {
        assert.notOk(err);
        assert.deepEqual(result, mockAccount);
        done();
      });
    });
  });
});