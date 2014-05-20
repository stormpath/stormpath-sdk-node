var common = require('./common');
var sinon = common.sinon;

var utils = require('../lib/utils');
var Account = require('../lib/resource/Account');
var Group = require('../lib/resource/Group');
var Tenant = require('../lib/resource/Tenant');
var Application = require('../lib/resource/Application');
var AuthenticationResult = require('../lib/resource/AuthenticationResult');
var DataStore = require('../lib/ds/DataStore');
var jwt = require('jwt-simple');
var uuid = require('node-uuid');
var url = require('url');

describe('Resources: ', function () {
  describe('Application resource', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});
    describe('authenticate account', function () {
      var authRequest = {username: 'test'};

      describe('createSsoUrl', function () {
        var clientApiKeySecret = uuid();
        var dataStore = new DataStore({apiKey: {id: '1', secret: clientApiKeySecret}});
        var app = {
          href:'http://api.stormpath.com/v1/applications/' + uuid()
        };
        var application = new Application(app, dataStore);
        var clientState = uuid();

        var redirectUrl = application.createSsoUrl({
          cb_uri: 'https://stormpath.com',
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

      function SsoResponseTest(options){
        var self = this;
        self.before = function(){
          self.clientApiKeySecret = uuid();
          var dataStore = new DataStore({
            apiKey: {id: uuid(), secret: self.clientApiKeySecret}
          });
          var app = {href:'http://api.stormpath.com/v1/applications/'+uuid()};
          self.application = new Application(app, dataStore);
          self.getResourceStub = sinon.stub(dataStore,'getResource',function(){
            var args = Array.prototype.slice.call(arguments);
            var href = args.shift();
            var callback = args.pop();
            callback(null,{href:href});
          });
          self.redirectUrl = self.application.createSsoUrl(options);
          var params = url.parse(self.redirectUrl,true).query;
          self.jwtRequest = self.decodeJwtRequest(params.jwtRequest);
          self.cbSpy = sinon.spy();
        };
        self.parseSsoResponse = function(responseUri){
          self.application.parseSsoResponse(responseUri,self.cbSpy);
        };
        self.after = function(){
          self.getResourceStub.restore();
        };
        self.decodeJwtRequest = function(jwtRequest){
          return jwt.decode(decodeURIComponent(jwtRequest),self.clientApiKeySecret);
        };
        return self;
      }

      describe('parseSsoResponse',function(){
        describe('without a cb_uri',function(){
          var test = new SsoResponseTest();
          it('should throw the cb_uri required error',function(){
            common.assert.throws(test.before,
              'cb_uri URI must be provided and must be in your SSO whitelist'
            );
          });
        });

        describe('with a happy roundtrip',function(){
          var accountHref = uuid();
          var clientState = uuid();
          var test = new SsoResponseTest({
            cb_uri: '/',
            state: clientState
          });
          before(function(){
            test.before();
            var responseJwt = jwt.encode({
              sub: accountHref,
              nonce: test.jwtRequest.jti,
              state: test.jwtRequest.state
            },test.clientApiKeySecret,'HS256');
            var responseUri = '/somewhere?id_token=' + responseJwt + '&state=' + test.givenState;
            test.parseSsoResponse(responseUri);
          });
          after(function(){
            test.after();
          });
          it('should succeed and fetch the account resource',function(){
            test.cbSpy.should.have.been.calledWith(null,{href:accountHref});
          });
        });

        describe('with an unkown nonce',function(){
          var test = new SsoResponseTest({
            cb_uri: '/'
          });
          before(function(){
            test.before();
            var responseJwt = jwt.encode({
              nonce: 'not the nonce that was given'
            },test.clientApiKeySecret,'HS256');
            var responseUri = '/somewhere?id_token=' + responseJwt + '&state=';
            test.parseSsoResponse(responseUri);
          });
          after(function(){
            test.after();
          });
          it('should reject the nonce',function(){
            common.assert.equal(test.cbSpy.args[0][0].message,'Invalid nonce');
          });
        });

        describe('with a modified client state',function(){
          var clientState = uuid();
          var test = new SsoResponseTest({
            cb_uri: '/',
            state: clientState
          });
          before(function(){
            test.before();
            var responseJwt = jwt.encode({
              nonce: test.jwtRequest.jti
            },test.clientApiKeySecret,'HS256');
            var responseUri = '/somewhere?id_token=' + responseJwt + '&state='  + 'not the state that was given';
            test.parseSsoResponse(responseUri);
          });
          after(function(){
            test.after();
          });

          it('should reject the state',function(){
            common.assert.equal(test.cbSpy.args[0][0].message,'Client state has been modified');
          });
        });

        describe('with an invalid signature',function(){
          var clientState = uuid();
          var test = new SsoResponseTest({
            cb_uri: '/',
            state: clientState
          });
          before(function(){
            test.before();
            var responseJwt = jwt.encode({
              nonce: test.givenNonce,
              state: test.givenState
            },'not the right key','HS256');
            var responseUri = '/somewhere?id_token=' + responseJwt + '&state=' + test.givenState;
            test.parseSsoResponse(responseUri);
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
  });
});