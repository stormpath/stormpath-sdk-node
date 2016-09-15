'use strict';

var assert = require('assert');
var sinon = require('sinon');

var ApiKey = require('../lib/resource/ApiKey');
var Account = require('../lib/resource/Account');

describe('resource', function() {
  describe('ApiKey', function() {
    var apiKey, sandbox, cbSpy, getAccountStub, account;

    before(function(done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();

      apiKey = new ApiKey({
        id: 'id',
        secret: 'secret'
      });

      account = new Account({
        givenName: 'm',
        surname: 'd',
        email: 'md@mailinator.com',
        password: 'Test64!',
      });

      getAccountStub = sandbox.stub(apiKey, 'getAccount', function(cb) {
        return cb(account);
      });

      done();
    });

    after(function () {
      sandbox.restore();
    });

    it('should provide a getAccount method', function() {
      assert(typeof apiKey.getAccount === 'function');
    });

    describe('getAccount', function() {
      it('should return an Account object', function() {
        assert(account instanceof Account);
        apiKey.getAccount(cbSpy);
        sinon.assert.calledOnce(getAccountStub);
      });
    });
  });
});
