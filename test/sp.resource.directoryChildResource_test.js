var common = require('./common');
var sinon = common.sinon;

var Tenant = require('../lib/resource/Tenant');
var Directory = require('../lib/resource/Directory');
var DirectoryChildResource = require('../lib/resource/DirectoryChildResource');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('Directory Child resource', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});

    describe('get directory', function () {
      describe('if directory href not set', function () {
        var dcr = new DirectoryChildResource();

        function getDirectoryWithoutHref() {
          dcr.getDirectory();
        }

        it('should throw unhandled exception', function () {
          getDirectoryWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if tenants href are set', function () {
        var sandbox, dcr, getResourceStub, cbSpy, obj, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          obj = {directory: {href: 'boom!'}};
          opt = {};
          dcr = new DirectoryChildResource(obj, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          dcr.getDirectory(cbSpy);
          // call with optional param
          dcr.getDirectory(opt, cbSpy);
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
            .calledWith(obj.directory.href, null, Directory, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(obj.directory.href, opt, Directory, cbSpy);
        });
      });
    });

    describe('get tenant', function () {
      describe('if tenants href not set', function () {
        var dcr = new DirectoryChildResource();

        function getTenantWithoutHref() {
          dcr.getTenant();
        }

        it('should throw unhandled exception', function () {
          getTenantWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if tenants href are set', function () {
        var sandbox, dcr, getResourceStub, cbSpy, app, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          app = {tenant: {href: 'boom!'}};
          opt = {};
          dcr = new DirectoryChildResource(app, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          dcr.getTenant(cbSpy);
          // call with optional param
          dcr.getTenant(opt, cbSpy);
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