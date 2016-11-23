var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;
var uuid = require('uuid');

var Account = require('../lib/resource/Account');
var AccountLink = require('../lib/resource/AccountLink');
var Tenant = require('../lib/resource/Tenant');
var Application = require('../lib/resource/Application');
var Directory = require('../lib/resource/Directory');
var IdSiteModel = require('../lib/resource/IdSiteModel');
var SmtpServer = require('../lib/resource/SmtpServer');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('Tenant resource class', function () {
    var dataStore;

    before(function () {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    });

    describe('get applications', function () {
      describe('if application not set', function () {
        //var tenant = new Tenant();

        //function getApplicationsWithoutHref() {
        //  tenant.getApplications();
        //}

        //it('should throw unhandled exception', function () {
        //  getApplicationsWithoutHref.should
        //    .throw(/cannot read property 'href' of undefined/i);
        //});
      });

      describe('if application set', function () {
        var sandbox, tenant, getResourceStub, cbSpy, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          opt = {};
          tenant = new Tenant({applications: {href: 'boom!'}}, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          tenant.getApplications(cbSpy);
          // call with optional param
          tenant.getApplications(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get application resource', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been.calledWith('boom!', null, Application, cbSpy);
          // call with optional param
          getResourceStub.should.have.been.calledWith('boom!', opt, Application, cbSpy);
        });
      });
    });

    describe('create application', function () {
      var sandbox, tenant, createResourceStub, cbSpy, app, opt;
      var createAppPath;

      before(function () {
        createAppPath = '/applications';
        sandbox = sinon.sandbox.create();
        app = {href: ''};
        opt = {};
        tenant = new Tenant({applications: {href: 'boom!'}}, dataStore);
        createResourceStub = sandbox.stub(dataStore, 'createResource',
          function (href, options, ctor, app, cb) {
            cb();
          });
        cbSpy = sandbox.spy();

        tenant.createApplication(app, cbSpy);
        tenant.createApplication(app, opt, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      it('should create application', function () {
        /* jshint -W030 */
        createResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        // call without optional param
        createResourceStub.should.have.been
          .calledWith(createAppPath, null, app, Application, cbSpy);
        // call with optional param
        createResourceStub.should.have.been
          .calledWith(createAppPath, opt, app, Application, cbSpy);
      });
    });

    describe('get directories', function () {
      describe('if directories not set', function () {
        //var tenant = new Tenant();

        //function getDirectoriesWithoutHref() {
        //  tenant.getDirectories();
        //}

        //it('should throw unhandled exception', function () {
        //  getDirectoriesWithoutHref.should
        //    .throw(/cannot read property 'href' of undefined/i);
        //});
      });

      describe('if application set', function () {
        var sandbox, tenant, getResourceStub, cbSpy, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          opt = {};
          tenant = new Tenant({directories: {href: 'boom!'}}, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          tenant.getDirectories(cbSpy);
          // call with optional param
          tenant.getDirectories(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get application resource', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been.calledWith('boom!', null, Directory, cbSpy);
          // call with optional param
          getResourceStub.should.have.been.calledWith('boom!', opt, Directory, cbSpy);
        });
      });
    });

    describe('create directory', function () {
      var sandbox, tenant, createResourceStub, cbSpy, app, opt;
      var createDirPath;

      before(function () {
        createDirPath = '/directories';
        sandbox = sinon.sandbox.create();
        app = {href: ''};
        opt = {};
        tenant = new Tenant({applications: {href: 'boom!'}}, dataStore);
        createResourceStub = sandbox.stub(dataStore, 'createResource',
          function (href, options, ctor, app, cb) {
            cb();
          });
        cbSpy = sandbox.spy();

        tenant.createDirectory(app, cbSpy);
        tenant.createDirectory(app, opt, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      it('should create application', function () {
        /* jshint -W030 */
        createResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        // call without optional param
        createResourceStub.should.have.been
          .calledWith(createDirPath, null, app, Directory, cbSpy);
        // call with optional param
        createResourceStub.should.have.been
          .calledWith(createDirPath, opt, app, Directory, cbSpy);
      });
    });

    describe('when calling .createSmtpServer()', function () {
      var options;
      var cbSpy;
      var tenant;
      var sandbox;
      var smtpServer;
      var createResourceStub;
      var createSmtpServerPath;

      before(function () {
        options = {};
        sandbox = sinon.sandbox.create();
        createSmtpServerPath = '/smtpServers';
        smtpServer = {name: '2dd1dfc4-08fa-4c1c-a721-af95f1bfe556'};
        tenant = new Tenant({applications: {href: 'boom!'}}, dataStore);

        createResourceStub = sandbox.stub(dataStore, 'createResource', function (arg1, arg2, arg3, arg4, callback) {
          callback();
        });

        cbSpy = sandbox.spy();

        tenant.createSmtpServer(smtpServer, cbSpy);
        tenant.createSmtpServer(smtpServer, options, cbSpy);
      });

      after(function () {
        sandbox.restore();
      });

      it('should call createResource with the /smtpServers path', function () {
        /* jshint -W030 */
        createResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        createResourceStub.should.have.been.calledWith(createSmtpServerPath, null, smtpServer, SmtpServer, cbSpy);
        createResourceStub.should.have.been.calledWith(createSmtpServerPath, options, smtpServer, SmtpServer, cbSpy);
      });
    });

    describe('when calling .getSmtpServers()', function () {
      var sandbox, tenant, getResourceStub, opts, cbSpy;

      before(function () {
        sandbox = sinon.sandbox.create();

        opts = {};

        tenant = new Tenant({
          smtpServers: {
            href: 'boom!'
          }
        }, dataStore);

        getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });

        cbSpy = sandbox.spy();

        tenant.getSmtpServers(opts, cbSpy);
        tenant.getSmtpServers(cbSpy);
      });

      after(function () {
        sandbox.restore();
      });

      it('should call getResource with the smtpServers href', function () {
        /* jshint -W030 */
        getResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        getResourceStub.should.have.been.calledWith('boom!', null, SmtpServer, cbSpy);
        getResourceStub.should.have.been.calledWith('boom!', opts, SmtpServer, cbSpy);
      });
    });

    describe('verify account email', function () {

      describe('with a successful token response',function(){
        var sandbox, tenant, tenantResult,cacheResult;
        var accountResponse;
        var evictSpy;

        before(function (done) {
          accountResponse = {
            href: '/v1/accounts/' + uuid(),
            status: 'ENABLED'
          };

          sandbox = sinon.sandbox.create();
          tenant = new Tenant({href:'an href'}, dataStore);

          evictSpy = sinon.spy(dataStore, '_evict');

          sandbox.stub(dataStore.requestExecutor, 'execute',
            // simulate a successful response
            function (reqOpts, cb) {
              cb(null,accountResponse);
            });

          tenant.verifyAccountEmail(uuid(), function(err,account){
            tenantResult = [err,account];
            dataStore.cacheHandler.get(account.href,function(err,account){
              cacheResult = [err,account];
              done();
            });
          });
        });
        after(function () {
          sandbox.restore();
        });

        it('should not err',function(){
          assert.equal(tenantResult[0],null);
        });
        it('should callback with an Account intance',function(){
          assert(tenantResult[1] instanceof Account,true);
        });
        it('should evict the account from the cache',function(){
          evictSpy.should.have.been.calledWith(accountResponse.href);
        });
        it('should put the updated account in the cache',function(){
          assert.deepEqual(cacheResult[1],accountResponse);
        });
      });
      describe('with an error response',function(){
        var sandbox, tenant, tenantResult;
        before(function (done) {
          sandbox = sinon.sandbox.create();
          tenant = new Tenant({href:'an href'}, dataStore);
          sandbox.stub(dataStore.requestExecutor, 'execute',
            // simulate an error response
            function (reqOpts, cb) {
              cb({status:404});
            });

          tenant.verifyAccountEmail(uuid(), function(err,account){
            tenantResult = [err,account];
            done();
          });
        });
        after(function () {
          sandbox.restore();
        });

        it('should err',function(){
          assert.notEqual(tenantResult[0],null);
          assert.equal(tenantResult[1],null);
        });
      });
    });

    describe('call to get id sites', function () {
      var sandbox, tenant, getResourceStub, opts, cbSpy;

      before(function () {
        sandbox = sinon.sandbox.create();

        opts = {};

        tenant = new Tenant({
          idSites: {
            href: 'boom!'
          }
        }, dataStore);

        getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });

        cbSpy = sandbox.spy();

        tenant.getIdSites(opts, cbSpy);
        tenant.getIdSites(cbSpy);
      });

      after(function () {
        sandbox.restore();
      });

      it('should process calls with and without params correctly', function () {
        /* jshint -W030 */
        getResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        getResourceStub.should.have.been.calledWith('boom!', null, IdSiteModel, cbSpy);
        getResourceStub.should.have.been.calledWith('boom!', opts, IdSiteModel, cbSpy);
      });
    });

    describe('create account link', function () {
      var sandbox;
      var tenant;
      var createResourceStub;
      var cbSpy;
      var opts;
      var createAccLinkPath;
      var leftAccount;
      var rightAccount;

      before(function () {
        createAccLinkPath = '/accountLinks';
        sandbox = sinon.sandbox.create();
        opts = {};
        tenant = new Tenant({}, dataStore);
        createResourceStub = sandbox.stub(dataStore, 'createResource',
          function (href, options, ctor, app, cb) {
            cb();
          });
        cbSpy = sandbox.spy();

        leftAccount = {
          href: 'leftBoom!'
        };

        rightAccount = {
          href: 'rightBoom!'
        };

        tenant.createAccountLink(leftAccount, rightAccount, cbSpy);
        tenant.createAccountLink(leftAccount, rightAccount, opts, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      it('should create application', function () {
        /* jshint -W030 */
        createResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        var expectedLink = {
          leftAccount: {
            href: 'leftBoom!'
          },
          rightAccount: {
            href: 'rightBoom!'
          }
        };

        // call without optional param
        createResourceStub.should.have.been
          .calledWith(createAccLinkPath, null, expectedLink, AccountLink, cbSpy);
        // call with optional param
        createResourceStub.should.have.been
          .calledWith(createAccLinkPath, opts, expectedLink, AccountLink, cbSpy);
      });
    });
  });

});
