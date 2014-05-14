var common = require('./common');
var sinon = common.sinon;

var utils = require('../lib/utils');
var Account = require('../lib/resource/Account');
var Group = require('../lib/resource/Group');
var Tenant = require('../lib/resource/Tenant');
var Application = require('../lib/resource/Application');
var AuthenticationResult = require('../lib/resource/AuthenticationResult');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('Application resource', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});
    describe('authenticate account', function () {
      var authRequest = {username: 'test'};
      describe('if login attempts not set', function () {
        var application = new Application();

        function authenticateAccountWithoutHref() {
          application.authenticateAccount(authRequest);
        }

        it('should throw unhandled exception', function () {
          authenticateAccountWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if login attempts are set', function () {
        var sandbox, app, application, createResourceStub, cbSpy;
        var expectedLoginAttempt1, expectedLoginAttempt2;
        before(function () {
          sandbox = sinon.sandbox.create();
          app = {loginAttempts: {href: 'boom!'}};
          application = new Application(app, dataStore);
          createResourceStub = sandbox
            .stub(dataStore, 'createResource', function () {
              var cb = Array.prototype.slice.call(arguments).pop();
              cb();
            });
          cbSpy = sandbox.spy();

          application.authenticateAccount({type: 'digest'}, cbSpy);
          // explicit check that login attempt type can be overridden
          expectedLoginAttempt1 = {
            type: 'digest',
            value: utils.base64.encode({}.username + ":" + {}.password)
          };

          application.authenticateAccount(authRequest, cbSpy);
          // implicit check that default type - 'basic'
          expectedLoginAttempt2 = {
            type: 'basic',
            value: utils.base64.encode(authRequest.username + ":" +
              authRequest.password)
          };
        });
        after(function () {
          sandbox.restore();
        });

        it('should create login attempt', function () {
          /* jshint -W030 */
          createResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          createResourceStub.should.have.been
            .calledWith(app.loginAttempts.href, {expand: 'account'}, expectedLoginAttempt1,
              AuthenticationResult, cbSpy);
          // call with optional param
          createResourceStub.should.have.been
            .calledWith(app.loginAttempts.href, {expand: 'account'}, expectedLoginAttempt2,
              AuthenticationResult, cbSpy);
        });
      });
    });

    describe('send password reset form', function () {
      describe('if password reset tokens href not set', function () {
        var application = new Application();

        function sendPasswordResetEmailWithoutHref() {
          application.sendPasswordResetEmail();
        }

        it('should throw unhandled exception', function () {
          sendPasswordResetEmailWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if password reset tokens href are set', function () {
        var sandbox, application, app, createResourceStub, cbSpy, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          opt ='userOrEmail';
          app = {passwordResetTokens: {href: 'boom!'}};
          application = new Application(app, dataStore);
          createResourceStub = sandbox.stub(dataStore, 'createResource', function (href, options, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          application.sendPasswordResetEmail(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should create password reset email request', function () {
          /* jshint -W030 */
          createResourceStub.should.have.been.calledOnce;
          cbSpy.should.have.been.calledOnce;
          /* jshint +W030 */

          createResourceStub.should.have.been
            .calledWith(app.passwordResetTokens.href, {email:opt}, cbSpy);
        });
      });
    });

    describe('verify password reset token', function () {
      describe('if password reset tokens href not set', function () {

        var application, token;
        function verifyPasswordResetToken() {
          application = new Application({}, dataStore);
          // call with optional param
          application.verifyPasswordResetToken(token, sinon.spy());
        }

        it('should throw unhandled exception', function () {
          verifyPasswordResetToken.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if password reset tokens href are set', function () {
        var sandbox, application, getResourceStub, cbSpy, app, token;
        before(function () {
          sandbox = sinon.sandbox.create();
          token = 'token';
          app = {passwordResetTokens: {href: 'boom!'}};
          application = new Application(app, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call with optional param
          application.verifyPasswordResetToken(token, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get verify reset password token', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledOnce;
          cbSpy.should.have.been.calledOnce;
          /* jshint +W030 */

          // call with optional param
          getResourceStub.should.have.been
            .calledWith(app.passwordResetTokens.href + '/' + token, cbSpy);
        });
      });
    });

    describe('get accounts', function () {
      describe('if accounts not set', function () {
        var application = new Application();

        function getAccountsWithoutHref() {
          application.getAccounts();
        }

        it('should throw unhandled exception', function () {
          getAccountsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if accounts are set', function () {
        var sandbox, application, getResourceStub, cbSpy, app, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          app = {accounts: {href: 'boom!'}};
          opt = {};
          application = new Application(app, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          application.getAccounts(cbSpy);
          // call with optional param
          application.getAccounts(opt, cbSpy);
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
            .calledWith(app.accounts.href, null, Account, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(app.accounts.href, opt, Account, cbSpy);
        });
      });
    });
    
    describe('create account', function () {
      describe('if accounts not set', function () {
        var application = new Application();

        function createAccountWithoutHref() {
          application.createAccount();
        }

        it('should throw unhandled exception', function () {
          createAccountWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if accounts are set', function () {
        var sandbox, application, createResourceStub, cbSpy, acc, app, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          acc = {};
          app = {accounts: {href: 'boom!'}};
          opt = {};
          application = new Application(app, dataStore);
          createResourceStub = sandbox.stub(dataStore, 'createResource',
            function (href, options, account, ctor, cb) {
              cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          application.createAccount(acc, cbSpy);
          // call with optional param
          application.createAccount(acc, opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should create account', function () {
          /* jshint -W030 */
          createResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          createResourceStub.should.have.been
            .calledWith(app.accounts.href, null, acc, Account, cbSpy);
          // call with optional param
          createResourceStub.should.have.been
            .calledWith(app.accounts.href, opt, acc, Account, cbSpy);
        });
      });
    });

    describe('get groups', function () {
      describe('if groups href not set', function () {
        var application = new Application();

        function getAccountsWithoutHref() {
          application.getGroups();
        }

        it('should throw unhandled exception', function () {
          getAccountsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if groups href are set', function () {
        var sandbox, application, getResourceStub, cbSpy, app, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          app = {groups: {href: 'boom!'}};
          opt = {};
          application = new Application(app, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          application.getGroups(cbSpy);
          // call with optional param
          application.getGroups(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get groups', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been
            .calledWith(app.groups.href, null, Group, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(app.groups.href, opt, Group, cbSpy);
        });
      });
    });

    describe('create group', function () {
      describe('if groups href not set', function () {
        var application = new Application();

        function createGroupWithoutHref() {
          application.createGroup();
        }

        it('should throw unhandled exception', function () {
          createGroupWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if groups href are set', function () {
        var sandbox, application, createResourceStub, cbSpy, group, app, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          group = {};
          app = {groups: {href: 'boom!'}};
          opt = {};
          application = new Application(app, dataStore);
          createResourceStub = sandbox.stub(dataStore, 'createResource',
            function (href, options, groups, ctor, cb) {
              cb();
            });
          cbSpy = sandbox.spy();

          // call without optional param
          application.createGroup(group, cbSpy);
          // call with optional param
          application.createGroup(group, opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should create account', function () {
          /* jshint -W030 */
          createResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          createResourceStub.should.have.been
            .calledWith(app.groups.href, null, group, Group, cbSpy);
          // call with optional param
          createResourceStub.should.have.been
            .calledWith(app.groups.href, opt, group, Group, cbSpy);
        });
      });
    });
    
    describe('get tenant', function () {
      describe('if tenants href not set', function () {
        var application = new Application();

        function getAccountsWithoutHref() {
          application.getTenant();
        }

        it('should throw unhandled exception', function () {
          getAccountsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if tenants href are set', function () {
        var sandbox, application, getResourceStub, cbSpy, app, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          app = {tenant: {href: 'boom!'}};
          opt = {};
          application = new Application(app, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          application.getTenant(cbSpy);
          // call with optional param
          application.getTenant(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get tenants', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been
            .calledWith(app.tenant.href, null, Tenant, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(app.tenant.href, opt, Tenant, cbSpy);
        });
      });
    });

    describe('get account',function(){
      function getAccount(isNew, data) {
        return function () {
          var appObj, accObj, app, resp;
          before(function (done) {
            // assert
            accObj = {href: '/accounts/href', name: 'provider name'};
            appObj = {accounts: {href: accObj.href}};
            app = new Application(appObj, dataStore);

            nock(u.BASE_URL).post(u.v1(accObj.href)).reply(isNew ? 201: 200, accObj);

            var args = [{}];
            if (data) {
              args.push(data);
            }
            args.push(function cb(err, acc) {
              resp = acc;
              done();
            });

            // act
            app.getAccount.apply(app, args);
          });

          it('should get provider data', function () {
            resp.account.href.should.be.equal(accObj.href);
            resp.account.name.should.be.equal(accObj.name);
            resp.created.should.be.equal(isNew);
          });

          it('should be an instance of ProviderData', function () {
            resp.account.should.be.an.instanceOf(Account);
          });
        };
      }

      describe('without options', getAccount(false));
      describe('without options', getAccount(true));
      describe('with options', getAccount(false, {}));
      describe('with options', getAccount(true, {}));
    });
  });
});