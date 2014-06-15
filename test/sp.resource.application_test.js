/* jshint -W030 */
var common = require('./common');
var sinon = common.sinon;
var nock = common.nock;
var u = common.u;

var utils = require('../lib/utils');
var Account = require('../lib/resource/Account');
var Group = require('../lib/resource/Group');
var Tenant = require('../lib/resource/Tenant');
var Directory = require('../lib/resource/Directory');
var Application = require('../lib/resource/Application');
var AuthenticationResult = require('../lib/resource/AuthenticationResult');
var AccountStoreMapping = require('../lib/resource/AccountStoreMapping');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  "use strict";
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
          opt = 'userOrEmail';
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
            .calledWith(app.passwordResetTokens.href, {email: opt}, cbSpy);
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

    describe('reset password', function(){
      var application, cbSpy, app, acc, token, password, response;
      before(function(done){
        // Arrange
        token = 'test_token';
        password = 'test_password';
        acc = { href: '/test/account/href' };
        app = {passwordResetTokens: {href: '/test/passwordResetTokens/href'}};
        application = new Application(app, dataStore);
        cbSpy = sinon.spy(function(err, resp){
          response = resp;
          done();
        });
        nock(u.BASE_URL)
          .post(u.v1(app.passwordResetTokens.href + '/' + token), { password: password })
          .reply(200, { account: acc });

        //Act
        application.resetPassword(token, password, cbSpy);
      });
      after(function(){});

      // Assert
      it('should sent post request with password in body', function(){
        cbSpy.should.have.been.calledOnce;
        response.account.href.should.be.equal(acc.href);
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

    describe('get account store mappings', function () {
      function getAccountStoreMappings(data) {
        return function () {
          var appObj, asmObj, app, asm;
          before(function (done) {
            // assert
            asmObj = {href: '/account/store/mapping/href', name: 'asm name'};
            appObj = {accountStoreMappings: {href: asmObj.href}};
            app = new Application(appObj, dataStore);

            nock(u.BASE_URL).get(u.v1(asmObj.href)).reply(200, asmObj);

            var args = [];
            if (data) {
              args.push(data);
            }
            args.push(function cb(err, mapping) {
              asm = mapping;
              done();
            });

            // act
            app.getAccountStoreMappings.apply(app, args);
          });
          it('should get account store mapping data', function () {
            asm.href.should.be.equal(asm.href);
            asm.name.should.be.equal(asm.name);
          });

          it('should be an instance of AccountStoreMapping', function () {
            asm.should.be.an.instanceOf(AccountStoreMapping);
          });
        };
      }

      describe('without options', getAccountStoreMappings());
      describe('with options', getAccountStoreMappings({}));
    });

    describe('get default account store', function () {
      function getDefaultAccountStore(data) {
        return function () {
          var appObj, asmObj, app, asm;
          before(function (done) {
            // assert
            asmObj = {href: '/account/store/mapping/href', name: 'asm name'};
            appObj = {defaultAccountStoreMapping: {href: asmObj.href}};
            app = new Application(appObj, dataStore);

            nock(u.BASE_URL).get(u.v1(asmObj.href)).reply(200, asmObj);

            var args = [];
            if (data) {
              args.push(data);
            }
            args.push(function cb(err, mapping) {
              asm = mapping;
              done();
            });

            // act
            app.getDefaultAccountStore.apply(app, args);
          });
          it('should get default account store mapping data', function () {
            asm.href.should.be.equal(asm.href);
            asm.name.should.be.equal(asm.name);
          });

          it('should be an instance of AccountStoreMapping', function () {
            asm.should.be.an.instanceOf(AccountStoreMapping);
          });
        };
      }

      describe('without options', getDefaultAccountStore());
      describe('with options', getDefaultAccountStore({}));
      describe('if default account store not set', function () {
        var appObj, app, cbSpy;
        before(function () {
          // assert
          appObj = {defaultAccountStoreMapping: null};
          app = new Application(appObj, dataStore);
          cbSpy = sinon.spy();

          // act
          app.getDefaultAccountStore(cbSpy);
        });

        it('should call cb without options', function () {
          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWith(undefined, undefined);
        });
      });
    });

    describe('set default account store', function () {
      var sandbox, storeObj, store, appObj, asmObj, app, asm, evokeSpy, cbSpy;
      before(function (done) {
        // arrange
        asmObj = { href: '/asm/href', offset: 0, limit: 25, items: [] };
        appObj = { href: '/app/test/href', name: 'test app name', accountStoreMappings: {href: asmObj.href}};
        storeObj = {href: '/directories/href', name: 'test dir name'};
        app = new Application(appObj, dataStore);
        store = new Directory(storeObj, dataStore);
        sandbox = sinon.sandbox.create();
        evokeSpy = sandbox.spy(app.dataStore, '_evict');
        cbSpy = sandbox.spy(done);
        nock(u.BASE_URL)
          .get(u.v1(app.accountStoreMappings.href))
          .reply(200, asmObj)

          .post(u.v1('/accountStoreMappings'))
          .reply(201, function (uri, reqBody) {
            asm = JSON.parse(reqBody);
            asm.href = '/accountStoreMappings/href';
            return asm;
          });

        // act
        app.setDefaultAccountStore(store, cbSpy);
      });

      after(function(){
        sandbox.restore();
      });

      // assert
      it('should create and save account store mapping, with application and account store', function () {
        asm.isDefaultAccountStore.should.be.true;
        asm.accountStore.href.should.be.equal(storeObj.href);
        asm.application.href.should.be.equal(app.href);
      });

      it('should invalidate application cache', function(){
        evokeSpy.should.have.been.calledOnce;
        evokeSpy.should.have.been.calledWith(appObj.href);

      });

      it('callback should be called once', function () {
        cbSpy.should.have.been.calledOnce;
      });
    });

    describe('get default group store', function () {
      function getDefaultGroupStore(data) {
        return function () {
          var appObj, asmObj, app, asm;
          before(function (done) {
            // assert
            asmObj = {href: '/account/store/mapping/href', name: 'asm name'};
            appObj = {defaultGroupStoreMapping: {href: asmObj.href}};
            app = new Application(appObj, dataStore);

            nock(u.BASE_URL).get(u.v1(asmObj.href)).reply(200, asmObj);

            var args = [];
            if (data) {
              args.push(data);
            }
            args.push(function cb(err, mapping) {
              asm = mapping;
              done();
            });

            // act
            app.getDefaultGroupStore.apply(app, args);
          });
          it('should get default group store mapping data', function () {
            asm.href.should.be.equal(asm.href);
            asm.name.should.be.equal(asm.name);
          });

          it('should be an instance of AccountStoreMapping', function () {
            asm.should.be.an.instanceOf(AccountStoreMapping);
          });
        };
      }

      describe('without options', getDefaultGroupStore());
      describe('with options', getDefaultGroupStore({}));
      describe('if default group store not set', function () {
        var appObj, app, cbSpy;
        before(function () {
          // assert
          appObj = {defaultGroupStoreMapping: null};
          app = new Application(appObj, dataStore);
          cbSpy = sinon.spy();

          // act
          app.getDefaultGroupStore(cbSpy);
        });

        it('should call cb without options', function () {
          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWith(undefined, undefined);
        });
      });
    });

    describe('set default group store', function () {
      var sandbox, storeObj, store, appObj, asmObj, app, evokeSpy, asm, cbSpy;
      before(function (done) {
        // arrange
        asmObj = { href: '/asm/href', offset: 0, limit: 25, items: [] };
        appObj = { href: '/app/test/href', name: 'test app name', accountStoreMappings: {href: asmObj.href}};
        storeObj = {href: '/directories/href', name: 'test dir name'};
        app = new Application(appObj, dataStore);
        store = new Directory(storeObj, dataStore);
        sandbox = sinon.sandbox.create();
        evokeSpy = sinon.spy(app.dataStore, '_evict');
        cbSpy = sinon.spy(done);
        nock(u.BASE_URL)
          .get(u.v1(app.accountStoreMappings.href))
          .reply(200, asmObj)

          .post(u.v1('/accountStoreMappings'))
          .reply(201, function (uri, reqBody) {
            asm = JSON.parse(reqBody);
            asm.href = '/accountStoreMappings/href';
            return asm;
          });

        // act
        app.setDefaultGroupStore(store, cbSpy);
      });

      after(function(){
        sandbox.restore();
      });

      // assert
      it('should create and save account store mapping, with application and account store', function () {
        asm.isDefaultGroupStore.should.be.true;
        asm.accountStore.href.should.be.equal(storeObj.href);
        asm.application.href.should.be.equal(app.href);
      });

      it('should invalidate application cache', function(){
        evokeSpy.should.have.been.calledOnce;
        evokeSpy.should.have.been.calledWith(appObj.href);
      });

      it('callback should be called once', function () {
        cbSpy.should.have.been.calledOnce;
      });
    });

    describe('create account store mapping', function () {
      var asmObj, appObj, app, storeObj, asm, cbSpy;
      before(function (done) {
        // arrange
        appObj = { href: '/app/test/href', name: 'test app name'};
        storeObj = {href: '/directories/href'};
        asmObj = { href: '/asm/href', isDefaultGroupStore: true, accountStore: storeObj };

        app = new Application(appObj, dataStore);
        cbSpy = sinon.spy();
        nock(u.BASE_URL)
          .post(u.v1('/accountStoreMappings'))
          .reply(201, function (uri, reqBody) {
            asm = JSON.parse(reqBody);
            asm.href = '/accountStoreMappings/href';
            done();
            return asm;
          });

        // act
        app.createAccountStoreMapping(asmObj, cbSpy);
      });

      // assert
      it('should create account store mapping, from provided object', function () {
        asm.isDefaultGroupStore.should.be.true;
        asm.accountStore.href.should.be.equal(storeObj.href);
      });

      it('should set current application', function () {
        asm.application.href.should.be.equal(app.href);
        cbSpy.should.have.been.calledOnce;
      });
    });

    describe('add account store', function () {
      var storeObj, store, appObj, app, asm, cbSpy;
      before(function (done) {
        // arrange
        appObj = { href: '/app/test/href', name: 'test app name'};
        storeObj = {href: '/directories/href', name: 'test dir name'};
        app = new Application(appObj, dataStore);
        store = new Directory(storeObj, dataStore);
        cbSpy = sinon.spy();
        nock(u.BASE_URL)
          .post(u.v1('/accountStoreMappings'))
          .reply(201, function (uri, reqBody) {
            asm = JSON.parse(reqBody);
            asm.href = '/accountStoreMappings/href';
            done();
            return asm;
          });

        // act
        app.addAccountStore(store, cbSpy);
      });

      // assert
      it('should set account store and set current application', function () {
        asm.accountStore.href.should.be.equal(storeObj.href);
        asm.application.href.should.be.equal(app.href);
        cbSpy.should.have.been.calledOnce;
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