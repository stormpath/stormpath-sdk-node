'use strict';

var assert = require('assert');
var sinon = require('sinon');
var uuid = require('uuid');

var ApiKey = require('../lib/resource/ApiKey');
var DataStore = require('../lib/ds/DataStore');

describe('resource', function() {
  describe('ApiKey', function() {
    var clientApiKeySecret, sandbox, cbSpy, apiKey, getResourceStub;

    before(function(done) {
      clientApiKeySecret = uuid();
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();

      apiKey = new ApiKey({
        id: 'id',
        secret: 'secret',
        account: {
          href: '/boom'
        }
      });

      apiKey.dataStore = new DataStore({
        client: {
          apiKey: {
            id: '1',
            secret: clientApiKeySecret
          }
        }
      });

      getResourceStub = sinon.stub(apiKey.dataStore, 'getResource', function() {
        var args = Array.prototype.slice.call(arguments);
        var href = args.shift();
        var callback = args.pop();
        callback(null, {href: href});
      });

      done();
    });

    after(function() {
      sandbox.restore();
    });

    it('should provide a getAccount method', function() {
      assert(typeof apiKey.getAccount === 'function');
    });

    describe('getAccount', function() {
      it('should return an Account object', function(done) {
        apiKey.getAccount(function(err, account) {
          if (err) {
            return done(err);
          }

          assert(account.href === '/boom');
          assert(getResourceStub.calledOnce);

          done();
        });
      });
    });
  });
});
