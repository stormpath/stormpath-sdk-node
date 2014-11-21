/* jshint -W030 */
var common = require('./common');
var sinon = common.sinon;
var nock = common.nock;
var u = common.u;

var assert = common.assert;
var _ = common._;
var errorMessages = require('../lib/error/messages');
var utils = require('../lib/utils');
var Account = require('../lib/resource/Account');
var Group = require('../lib/resource/Group');
var Tenant = require('../lib/resource/Tenant');
var Directory = require('../lib/resource/Directory');
var Application = require('../lib/resource/Application');
var AuthenticationResult = require('../lib/resource/AuthenticationResult');
var AccountStoreMapping = require('../lib/resource/AccountStoreMapping');
var ApiKey = require('../lib/resource/ApiKey');
var DataStore = require('../lib/ds/DataStore');
var jwt = require('jwt-simple');
var uuid = require('node-uuid');
var url = require('url');

describe('Resources: ', function () {
  "use strict";
  describe('Application resource', function () {

    var dataStore = new DataStore({
      apiKey: {
        id: 1,
        // this secret will decrypt the api keys correctly
        secret: '6b2c3912-4779-49c1-81e7-23c204f43d2d'
      }
    });
    describe('authenticate account', function () {
      var authRequest = {username: 'test'};

      describe('createIdSiteUrl', function () {
        var clientApiKeySecret = uuid();
        var dataStore = new DataStore({apiKey: {id: '1', secret: clientApiKeySecret}});
        var app = {
          href:'http://api.stormpath.com/v1/applications/' + uuid()
        };
        var application = new Application(app, dataStore);
        var clientState = uuid();

        var redirectUrl = application.createIdSiteUrl({
          callbackUri: 'https://stormpath.com',
          state: clientState
        });

        var params = url.parse(redirectUrl,true).query;
        var path = url.parse(redirectUrl).pathname;

        it('should create a request to /sso',function(){
          common.assert.equal(path,'/sso');
        });

        it('should create a url with a jwtRequest',function(){
          common.assert.isNotNull(params.jwtRequest);
        });
        it('should create a jwtRequest that is signed with the client secret',
          function(){
            common.assert.equal(
              jwt.decode(params.jwtRequest,clientApiKeySecret).state,
              clientState
            );
          }
        );

      });


      describe('createIdSiteUrl with logout option', function () {
        var clientApiKeySecret = uuid();
        var dataStore = new DataStore({apiKey: {id: '1', secret: clientApiKeySecret}});
        var app = {
          href:'http://api.stormpath.com/v1/applications/' + uuid()
        };
        var application = new Application(app, dataStore);
        var clientState = uuid();

        var redirectUrl = application.createIdSiteUrl({
          callbackUri: 'https://stormpath.com',
          state: clientState,
          logout: true
        });

        var params = url.parse(redirectUrl,true).query;
        var path = url.parse(redirectUrl).pathname;

        it('should create a request to /sso/logout',function(){
          common.assert.equal(path,'/sso/logout');
        });

        it('should create a url with a jwtRequest',function(){
          common.assert.isNotNull(params.jwtRequest);
        });
        it('should create a jwtRequest that is signed with the client secret',
          function(){
            common.assert.equal(
              jwt.decode(params.jwtRequest,clientApiKeySecret).state,
              clientState
            );
          }
        );

      });

      function SsoResponseTest(options){
        var self = this;
        self.before = function(){
          self.clientApiKeySecret = uuid();
          self.clientApiKeyId = uuid();
          var dataStore = new DataStore({
            apiKey: {id: self.clientApiKeyId, secret: self.clientApiKeySecret}
          });
          var app = {href:'http://api.stormpath.com/v1/applications/'+uuid()};
          self.application = new Application(app, dataStore);
          self.getResourceStub = sinon.stub(dataStore,'getResource',function(){
            var args = Array.prototype.slice.call(arguments);
            var href = args.shift();
            var callback = args.pop();
            var Ctor = (args.length > 0 ) ? args.shift() : function Ctor(){};
            callback(null,new Ctor({href:href}));
          });
          self.redirectUrl = self.application.createIdSiteUrl(options);
          var params = url.parse(self.redirectUrl,true).query;
          self.jwtRequest = self.decodeJwtRequest(params.jwtRequest);
          self.cbSpy = sinon.spy();
        };
        self.handleIdSiteCallback = function(responseUri){
          self.application.handleIdSiteCallback(responseUri,self.cbSpy);
        };
        self.after = function(){
          self.getResourceStub.restore();
        };
        self.decodeJwtRequest = function(jwtRequest){
          return jwt.decode(decodeURIComponent(jwtRequest),self.clientApiKeySecret);
        };
        return self;
      }

      describe('handleIdSiteCallback',function(){
        describe('without a callbackUri',function(){
          var test = new SsoResponseTest();
          it('should throw the callbackUri required error',function(){
            common.assert.throws(test.before,errorMessages.ID_SITE_INVALID_CB_URI);
          });
        });

        describe('with out the responseUri argument',function(){
          var test = new SsoResponseTest({
            callbackUri: '/',
            state: uuid()
          });
          before(function(){
            test.before();
          });
          after(function(){
            test.after();
          });
          it('should throw',function(){
            assert.throws(test.handleIdSiteCallback);
          });
        });


        describe('with a valid jwt response',function(){
          var accountHref = uuid();
          var clientState = uuid();
          var statusValue = uuid();
          var test = new SsoResponseTest({
            callbackUri: '/',
            state: clientState
          });
          var responseJwt;
          before(function(){
            test.before();
            responseJwt = {
              sub: accountHref,
              irt: test.jwtRequest.jti,
              state: test.jwtRequest.state,
              aud: test.clientApiKeyId,
              exp: utils.nowEpochSeconds() + 1,
              isNewSub: false,
              status: statusValue
            };
            var responseUri = '/somewhere?jwtResponse=' +
              jwt.encode(responseJwt,test.clientApiKeySecret,'HS256') + '&state=' + test.givenState;
            test.handleIdSiteCallback(responseUri);
          });
          after(function(){
            test.after();
          });
          it('should not error',function(){
            var result = test.cbSpy.args[0];
            common.assert.equal(result[0],null);
          });
          it('should return an account property on the idSiteResult',function(){
            var result = test.cbSpy.args[0];
            common.assert.instanceOf(result[1].account,Account);
          });
          it('should return the correct account on the idSiteResult',function(){
            var result = test.cbSpy.args[0];
            common.assert.equal(result[1].account.href,accountHref);
          });
          it('should set the isNew property on the idSiteResult',function(){
            var result = test.cbSpy.args[0];
            common.assert.equal(result[1].isNew,false);
          });
          it('should set the state property on the idSiteResult',function(){
            var result = test.cbSpy.args[0];
            common.assert.equal(result[1].state,clientState);
          });
          it('should set the status property on the idSiteResult',function(){
            var result = test.cbSpy.args[0];
            common.assert.equal(result[1].status,statusValue);
          });
        });


        describe('with an expired token',function(){
          var accountHref = uuid();
          var clientState = uuid();
          var responseJwt;
          var test = new SsoResponseTest({
            callbackUri: '/',
            state: clientState
          });
          before(function(){
            test.before();
            responseJwt = jwt.encode({
              sub: accountHref,
              irt: test.jwtRequest.jti,
              state: test.jwtRequest.state,
              aud: test.clientApiKeyId,
              exp: utils.nowEpochSeconds() - 1
            },test.clientApiKeySecret,'HS256');
            var responseUri = '/somewhere?jwtResponse=' + responseJwt + '&state=' + test.givenState;
            test.handleIdSiteCallback(responseUri,'jwt');
          });
          after(function(){
            test.after();
          });
          it('should error with the expiration error',function(){
            common.assert.equal(test.cbSpy.args[0][0].message,errorMessages.ID_SITE_JWT_HAS_EXPIRED);
          });
        });

        describe('with a different client id (aud)',function(){
          var accountHref = uuid();
          var clientState = uuid();
          var responseJwt;
          var test = new SsoResponseTest({
            callbackUri: '/',
            state: clientState
          });
          before(function(){
            test.before();
            responseJwt = jwt.encode({
              sub: accountHref,
              irt: test.jwtRequest.jti,
              state: test.jwtRequest.state,
              aud: uuid(),
              exp: utils.nowEpochSeconds() - 1
            },test.clientApiKeySecret,'HS256');
            var responseUri = '/somewhere?jwtResponse=' + responseJwt + '&state=' + test.givenState;
            test.handleIdSiteCallback(responseUri,'jwt');
          });
          after(function(){
            test.after();
          });
          it('should error',function(){
            common.assert.instanceOf(test.cbSpy.args[0][0],Error);
            common.assert.equal(test.cbSpy.args[0][0].message,errorMessages.ID_SITE_JWT_INVALID_AUD);
          });
        });

        describe('with an invalid exp value',function(){
          var accountHref = uuid();
          var clientState = uuid();
          var responseJwt;
          var test = new SsoResponseTest({
            callbackUri: '/',
            state: clientState
          });
          before(function(){
            test.before();
            responseJwt = jwt.encode({
              sub: accountHref,
              irt: test.jwtRequest.jti,
              state: test.jwtRequest.state,
              aud: test.clientApiKeyId,
              exp: "yeah right"
            },test.clientApiKeySecret,'HS256');
            var responseUri = '/somewhere?jwtResponse=' + responseJwt + '&state=' + test.givenState;
            test.handleIdSiteCallback(responseUri,'jwt');
          });
          after(function(){
            test.after();
          });
          it('should error with the expiration error',function(){
            common.assert.equal(test.cbSpy.args[0][0].message,errorMessages.ID_SITE_JWT_HAS_EXPIRED);
          });
        });

        describe('with a replayed nonce',function(){
          var accountHref = uuid();
          var test = new SsoResponseTest({
            callbackUri: '/'
          });
          before(function(){
            test.before();
            var responseJwt = jwt.encode({
              sub: accountHref,
              irt: test.jwtRequest.jti,
              state: test.jwtRequest.state,
              aud: test.clientApiKeyId,
              exp: utils.nowEpochSeconds() + 1
            },test.clientApiKeySecret,'HS256');
            var responseUri = '/somewhere?jwtResponse=' + responseJwt + '&state=';
            test.handleIdSiteCallback(responseUri);
            test.handleIdSiteCallback(responseUri);
          });
          after(function(){
            test.after();
          });
          it('should succeed on the first try',function(){
            common.assert.equal(test.cbSpy.args[0][0],null);
          });
          it('should fail on the second try the nonce',function(){
            common.assert.equal(test.cbSpy.args[1][0].message,errorMessages.ID_SITE_JWT_ALREADY_USED);
          });
        });

        describe('with an invalid signature',function(){
          var clientState = uuid();
          var test = new SsoResponseTest({
            callbackUri: '/',
            state: clientState
          });
          before(function(){
            test.before();
            var responseJwt = jwt.encode({
              irt: test.givenNonce,
              state: test.givenState
            },'not the right key','HS256');
            var responseUri = '/somewhere?jwtResponse=' + responseJwt + '&state=' + test.givenState;
            test.handleIdSiteCallback(responseUri);
          });
          after(function(){
            test.after();
          });
          it('should reject the signature',function(){
            common.assert.equal(test.cbSpy.args[0][0].message,'Signature verification failed');
          });
        });

      });

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

      describe('if accountStore is provided', function(){
        var application, accountStore, app, cbSpy, username, password;
        before(function(done){
          // arrange
          username = 'test_username';
          password = 'test_password';
          app = { href: '/app/test/href', loginAttempts: {href: '/login/attempts/test/href'}};
          accountStore = { href: '/account/store/test/href'};
          application = new Application(app, dataStore);
          cbSpy = sinon.spy(done);
          nock(u.BASE_URL)
            .post(u.v1(app.loginAttempts.href) + '?expand=account',{
              value: utils.base64.encode(username + ":" + password),
              type: 'basic',
              accountStore: accountStore
            })
            .reply(200, {});

          // act
          application.authenticateAccount({
            username: username,
            password: password,
            accountStore: accountStore
          }, cbSpy);
        });

        // assert
        it('should provide account store in request', function(){
          cbSpy.should.have.been.calledOnce;
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
          .post(u.v1(app.passwordResetTokens.href + '/' + token  + '?expand=account'), { password: password })
          .reply(200, { account: acc });

        //Act
        application.resetPassword(token, password, cbSpy);
      });

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

    describe('resend verification email', function () {
      var app, createResourceStub;
      var options = {login:uuid()};
      var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});
      before(function (done) {

        app = new Application(
          { href: uuid() , verificationEmails: {href:uuid()} },
          dataStore
        );

        createResourceStub = sinon.stub(dataStore,'createResource',function(){
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          callback();
        });

        app.resendVerificationEmail(options,done);
      });


      it('should pass the options to the store', function () {
        createResourceStub.should.have.been
            .calledWith(app.verificationEmails.href, options);
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
            "secret" : "NuUYYcIAjRYS+LiNBPhpu/p8iYP+jBltei1n1wxcMye3FTKRCTILpP/cD6Ynfvu6S4UokPM/SwuBaEn77aM3Ww==",
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

      var decryptedSecret = 'rncdUXr2dtjjQ5OyDdWRHRxncRW7K0OnU6/Wqf2iqdQ';
      var callCount=0;

      describe('when apikey is found',function(){
        var sandbox = sinon.sandbox.create();
        var result, requestedOptions, cacheResult;
        before(function(done){
          sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
            callCount++;
            // hack - override the salt
            requestOptions.query.encryptionKeySalt = 'uHMSUA6F8LFoCIPqKYSRCg==';
            requestedOptions = requestOptions;
            cb(null,_.extend({},foundResponse));
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
        it('should not err',function(){
          assert.equal(result[0],null);
        });
        it('should have asked for encrypted secret',function(){
          assert.equal(requestedOptions.query.encryptSecret,true);
        });
        it('should return an ApiKey instance',function(){
          assert.instanceOf(result[1],ApiKey);
        });
        it('should return an ApiKey instance with a decrypted secret',function(){
          assert.equal(result[1].secret,decryptedSecret);
        });
        it('should cache the ApiKey',function(){
          assert.equal(cacheResult[1].href,foundResponse.items[0].href);
        });
        it('should store the encrypted key in the cache',function(){
          assert.equal(cacheResult[1].secret,foundResponse.items[0].secret);
        });
      });
      describe('on second get',function(){
        var result;
        var sandbox = sinon.sandbox.create();
        before(function(done){
          sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
            cb(null,_.extend({},foundResponse.items[0].account));
          });
          application.getApiKey(foundResponse.items[0].id,function(err,value) {
            result = [err,value];
            done();
          });
        });
        after(function(){
          sandbox.restore();
        });
        it('should have got it from the cache',function(){
          assert.equal(callCount,1);
        });
        it('should get the api key with the decrypted secret',function(){
          assert.equal(result[1].secret,decryptedSecret);
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