var common = require('./common');
var sinon = common.sinon;

var Account = require('../lib/resource/Account');
var AuthenticationResult = require('../lib/resource/AuthenticationResult');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  "use strict";
  describe('Authentication Result resource', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});
    describe('get accounts', function () {
      describe('if accounts not set', function () {
        var authcResult = new AuthenticationResult();

        function getAccountsWithoutHref() {
          authcResult.getAccount();
        }

        it('should throw unhandled exception', function () {
          getAccountsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
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