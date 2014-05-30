var common = require('./common');
var sinon = common.sinon;
var assert = common.assert;

var utils = require('../lib/utils');
var Account = require('../lib/resource/Account');
var Group = require('../lib/resource/Group');
var Tenant = require('../lib/resource/Tenant');
var Application = require('../lib/resource/Application');
var AuthenticationResult = require('../lib/resource/AuthenticationResult');
var ApiKey = require('../lib/resource/ApiKey');
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

    describe('get apiKey',function(){
      var appHref = 'https://api.stormpath.com/v1/applications/someapp';
      var application = new Application({
        href:appHref,
        apiKeys: {
          href: appHref + '/apiKeys'
        }
      }, dataStore);

      var foundResponse = {
        "offset" : 0,
        "href" : "https://api.stormpath.com/v1/applications/1ux4vVy4SBeeLLfZtldtXj/apiKeys",
        "limit" : 25,
        "items" : [
          {
            "secret" : "zGvFGQh95FOrka7Ai5SWJsKmExhphZd6WqOciCiaFHDdlt3NP1VrbnpN0KO/9/VqTCoDCx66guqnIGdnuMJrpg==",
            "status" : "ENABLED",
            "account" : {
              "href" : "https://api.stormpath.com/v1/accounts/Uu87kzssxEcnjmhC9uzwF"
            },
            "id" : "1S9H13Q61HLJHIVU7N357QI7U",
            "tenant" : {
              "href" : "https://api.stormpath.com/v1/tenants/eU0gloBbz42wGUtGXEjED"
            },
            "href" : "https://api.stormpath.com/v1/apiKeys/1S9H13Q61HLJHIVU7N357QI7U"
          }
        ]
      };

      var notFoundResponse = {
        "offset" : 0,
        "href" : "https://api.stormpath.com/v1/applications/1234/apiKeys",
        "limit" : 25,
        "items" : []
      };

      describe('when apikey is found',function(){
        var sandbox = sinon.sandbox.create();
        var result, requestedOptions, cacheResult;
        before(function(done){
          sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
            requestedOptions = requestOptions;
            cb(null,foundResponse);
          });
          application.getApiKey('an id',function(err,value) {
            result = [err,value];
            dataStore.cacheHandler.get(foundResponse.items[0].href,function(err,value){
              cacheResult = [err,value];
              done();
            });

          });
        });
        after(function(){
          sandbox.restore();
        });
        it('should have asked for encrypted secret',function(){
          assert.equal(requestedOptions.query.encryptSecret,true);
        });
        it('should return an ApiKey instance',function(){
          assert.instanceOf(result[1],ApiKey);
        });
        it('should cache the ApiKey',function(){
          assert.equal(JSON.stringify(cacheResult[1]),JSON.stringify(foundResponse.items[0]));
        });
      });
      describe('on second get',function(){
        var result;
        before(function(done){
          application.getApiKey(foundResponse.items[0].id,function(err,value) {
            result = [err,value];
            done();
          });
        });
        it('should have the key from the cache',function(){
          assert.equal(JSON.stringify(result[1]),JSON.stringify(foundResponse.items[0]));
        });
      });
      describe('when apikey is not found',function(){
        var sandbox = sinon.sandbox.create();
        var result, requestedOptions;

        before(function(done){
          sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
            requestedOptions = requestOptions;
            cb(null,notFoundResponse);
          });
          application.getApiKey('an id',function(err,value) {
            result = [err,value];
            done();
          });
        });
        after(function(){
          sandbox.restore();
        });
        it('should have asked for encrypted secret',function(){
          assert.equal(requestedOptions.query.encryptSecret,true);
        });
        it('should return a not found error',function(){
          assert.equal(result[0].message,'ApiKey not found');
        });
      });
    });

  });
});