var common = require('./common');
var sinon = common.sinon;

var Account = require('../lib/resource/Account');
var Tenant = require('../lib/resource/Tenant');
var Application = require('../lib/resource/Application');
var Directory = require('../lib/resource/Directory');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('Tenant resource class', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});
    describe('get applications', function () {
      describe('if application not set', function () {
        var tenant = new Tenant();

        function getApplicationsWithoutHref() {
          tenant.getApplications();
        }

        it('should throw unhandled exception', function () {
          getApplicationsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
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
      var createAppPath = '/applications';
      before(function () {
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
        var tenant = new Tenant();

        function getDirectoriesWithoutHref() {
          tenant.getDirectories();
        }

        it('should throw unhandled exception', function () {
          getDirectoriesWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
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
      var createDirPath = '/directories';
      before(function () {
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

    describe('verify account email', function () {
      var sandbox, tenant, createResourceStub, cbSpy, token;
      var createEmailVerificationTokenPath = '/accounts/emailVerificationTokens/';
      before(function () {
        sandbox = sinon.sandbox.create();
        token = 'token!';
        tenant = new Tenant({}, dataStore);
        createResourceStub = sandbox.stub(dataStore, 'createResource',
          function (href, options, ctor, cb) {
            cb();
          });
        cbSpy = sandbox.spy();

        tenant.verifyAccountEmail(token, cbSpy);
      });
      after(function () {
        sandbox.restore();
      });

      it('should create application', function () {
        /* jshint -W030 */
        createResourceStub.should.have.been.calledOnce;
        cbSpy.should.have.been.calledOnce;
        /* jshint +W030 */

        // call without optional param
        createResourceStub.should.have.been
          .calledWith(createEmailVerificationTokenPath + token, null, Account, cbSpy);
        // call with optional param
        createResourceStub.should.have.been
          .calledWith(createEmailVerificationTokenPath + token, null, Account, cbSpy);
      });
    });
  });
});
