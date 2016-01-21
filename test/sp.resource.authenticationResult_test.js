"use strict";

var common = require('./common');
var sinon = common.sinon;
var assert = common.assert;
var timekeeper = common.timekeeper;

var Account = require('../lib/resource/Account');
var AuthenticationResult = require('../lib/resource/AuthenticationResult');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('Authentication Result resource', function () {
    var dataStore;

    before(function () {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    });

    describe('if ttl', function () {
      describe('isn\'t set', function () {
        it('should have a default value of 3600', function () {
          var result = new AuthenticationResult();
          assert.equal(result.ttl, 3600);
        });
      });

      describe('is set', function () {
        var app;
        var result;

        before(function () {
          app = {account: {href: 'boom!'}, dataStore: dataStore};
          result = new AuthenticationResult(app, dataStore);

          result.application = app;
          result.ttl = 9999;
        });

        it('should return jwt with specified ttl', function () {
          timekeeper.freeze(0);

          var jwt = result.getJwt();
          assert.equal(jwt.body.exp, new Date().getTime() + result.ttl);

          timekeeper.reset();
        });
      });
    });

    describe('get accounts', function () {
      describe('if accounts not set', function () {
        //var authcResult = new AuthenticationResult();

        //function getAccountsWithoutHref() {
        //  authcResult.getAccount();
        //}

        //it('should throw unhandled exception', function () {
        //  getAccountsWithoutHref.should
        //    .throw(/cannot read property 'href' of undefined/i);
        //});
      });

      describe('if accounts are set', function () {
        var sandbox, authcResult, getResourceStub, cbSpy, app, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          app = {account: {href: 'boom!'}};
          opt = {};
          authcResult = new AuthenticationResult(app, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          authcResult.getAccount(cbSpy);
          // call with optional param
          authcResult.getAccount(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get accounts', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been
            .calledWith(app.account.href, null, Account, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(app.account.href, opt, Account, cbSpy);
        });
      });
    });
  });
});
