var common = require('./common');
var tmp = require('tmp');
var fs = require('fs');
var assert = common.assert;
var sinon = common.sinon;
var expect = common.expect;

var Client = require('../lib/Client');
var Account = require('../lib/resource/Account');
var Group = require('../lib/resource/Group');
var GroupMembership = require('../lib/resource/GroupMembership');
var Directory = require('../lib/resource/Directory');
var Tenant = require('../lib/resource/Tenant');
var Application = require('../lib/resource/Application');
var DataStore = require('../lib/ds/DataStore');

function clearEnvVars(){
  var args = Array.prototype.slice.call(arguments);
  var saved = args.reduce(function(saved,arg){
    saved[arg] = process.env[arg];
    delete process.env[arg];
    return saved;
  },{});
  return function(){
    args.forEach(function(arg){
      process.env[arg] = saved[arg];
    });
  };
}

describe('Client', function () {
  var apiKey = {id: 1, secret: 2};
  describe('constructor', function () {
    var client;
    before(function () {
      client = new Client({apiKey: apiKey});
    });
    it('should create data store', function () {
      client._dataStore.should.be.an.instanceof(DataStore);
    });
    it('should init private current tenant field', function () {
      /* jshint -W030 */
      expect(client._currentTenant).to.be.null;
      /* jshint +W030 */
    });
  });


  describe('default constructor', function () {
    it('should throw if it\'s a bunk filename and env does not provide id or secret', function () {
      var filename = 'foo.bar';
      var resetEnvVars = clearEnvVars('STORMPATH_CLIENT_APIKEY_ID','STORMPATH_CLIENT_APIKEY_SECRET');
      assert.throws(function(){
        new Client({
          client:{
            apiKey:{
              file: filename
            }
          }
        });
      },new RegExp('Client API key file not found: ' + filename));
      resetEnvVars();
    });
    it('should throw if it\'s an invalid properties file', function () {
      var resetEnvVars = clearEnvVars('STORMPATH_CLIENT_APIKEY_ID','STORMPATH_CLIENT_APIKEY_SECRET');
      var tmpobj = tmp.fileSync();
      fs.writeSync(tmpobj.fd,'yo');
      fs.closeSync(tmpobj.fd);
      assert.throws(function(){
        new Client({
          client:{
            apiKey:{
              file: tmpobj.name
            }
          }
        });
      },new RegExp('Unable to read properties file: '+tmpobj.name));
      resetEnvVars();
    });
    it('should populate api key id secret on the config object', function(){
      var resetEnvVars = clearEnvVars('STORMPATH_CLIENT_APIKEY_ID','STORMPATH_CLIENT_APIKEY_SECRET');
      var tmpobj = tmp.fileSync();
      fs.writeSync(tmpobj.fd,'id=1\nsecret=2');
      fs.closeSync(tmpobj.fd);

      var client = new Client({
        client:{
          apiKey:{
            file: tmpobj.name
          }
        }
      });
      assert.equal(client.config.apiKey.id,'1');
      assert.equal(client.config.apiKey.secret,'2');
      resetEnvVars();
    });
  });

  describe('with an app href that has a valid default account store with email verification enabled', function() {
    var application, directory;

    before(function(done) {
      new Client().createApplication({ name:common.uuid() }, { createDirectory: true }, function(err, app) {
        if (err) { throw err; }

        application = app;
        application.getDefaultAccountStore(function(err, accountStoreMapping) {
          if (err) { throw err; }

          accountStoreMapping.getAccountStore(function(err, dir) {
            if (err) { throw err; }

            directory = dir;
            directory.getAccountCreationPolicy(function(err, policy) {
              if (err) { throw err; }

              policy.verificationEmailStatus = 'ENABLED';
              policy.save(done);
            });
          });
        });
      });
    });

    after(function(done) {
      application.delete(function() {
        directory.delete(done);
      });
    });

    it('should apply the account store policies to the config', function(done) {
      var client = new Client({ application: { href: application.href } });
      client.on('ready', function() {
        assert.equal(client.config.web.verifyEmail.enabled, true);
        done();
      });
    });
  });

  describe('with an app href that DOES NOT have a valid default account store',function(){
    var application;
    before(function(done){
      new Client().createApplication(
        {name:common.uuid()},
        {createDirectory: true},
        function(err,app){
          if(err){
            throw err;
          }else{
            application = app;
            done();
          }
        }
      );
    });
    after(function(done){
      application.delete(done);
    });
    it('should disable the email verification and password reset features',function(done){
      var client = new Client({
        application:{
          href: application.href
        }
      });
      client.on('ready',function(){
        assert.equal(client.config.web.verifyEmail.enabled,false);
        done();
      });
    });
  });

  describe('with an invalid app href',function(){

    it('should fail',function(done){
      var client = new Client({
        application:{
          href: 'https://api.stormpath.com/v1/applications/blah'
        }
      });
      client.on('error',function(err){
        assert.equal(err.status,404);
        done();
      });
    });
  });


  //
  //  TODO bring this test back when i figure out why nock
  //  is interfering with the application call
  //
  // describe('with an application name',function(){

  //   var application;
  //   before(function(done){
  //     new Client().createApplication(
  //       {name:common.uuid()},
  //       {createDirectory: true},
  //       function(err,app){
  //         if(err){
  //           throw err;
  //         }else{
  //           application = app;
  //           done();
  //         }
  //       }
  //     );
  //   });
  //   after(function(done){
  //     application.delete(done);
  //   });

  //   it('should fail',function(done){
  //     var client = new Client({
  //       application:{
  //         name: application.name
  //       }
  //     });
  //     client.on('ready',function(){
  //       assert.equal(client.config.application.href,application.href);
  //       done();
  //     });
  //   });
  // });

  describe('call get current tenant', function () {
    describe('fist call should get resource', function () {

      var sandbox, client, getResourceStub, cbSpy, err, tenant, onCurrentTenantCb;
      var currentTenantHref = '/tenants/current';
      before(function () {
        sandbox = sinon.sandbox.create();
        err = {error: 'boom!'};
        tenant = { href: 'foo'};
        client = new Client({apiKey: apiKey});
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, opt, ctor, cb) {
          onCurrentTenantCb = cb;
          if (opt && opt.error) {
            return cb(opt.error);
          }
          cb(null, opt && opt.tenant);
        });
        cbSpy = sandbox.spy();
      });
      after(function () {
        sandbox.restore();
      });

      it('should call get resource', function () {
        // call without optional param
        client.getCurrentTenant(cbSpy);
        client._currentTenant = null;

        getResourceStub.should.have.been
          .calledWith(currentTenantHref, null, Tenant, onCurrentTenantCb);
        cbSpy.should.have.been.calledWith(null, null);

        // call with optional param
        client.getCurrentTenant({tenant: tenant}, cbSpy);
        client._currentTenant = null;

        getResourceStub.should.have.been
          .calledWith(currentTenantHref, {tenant: tenant}, Tenant, onCurrentTenantCb);
        cbSpy.should.have.been.calledWith(null, tenant);

        // error
        client.getCurrentTenant({error: err}, cbSpy);

        getResourceStub.should.have.been
          .calledWith(currentTenantHref, {error: err}, Tenant, onCurrentTenantCb);
        cbSpy.should.have.been.calledWith(err);

        /* jshint -W030 */
        getResourceStub.should.have.been.calledThrice;
        cbSpy.should.have.been.calledThrice;
        /* jshint +W030 */
      });
    });

    describe('second and after call', function () {
      var sandbox, client, getResourceStub, cbSpy, err, tenant, onCurrentTenantCb;
      var currentTenantHref = '/tenants/current';
      before(function () {
        sandbox = sinon.sandbox.create();
        err = {error: 'boom!'};
        tenant = { href: 'foo'};
        client = new Client({apiKey: apiKey});
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, opt, ctor, cb) {
          onCurrentTenantCb = cb;
          if (opt && opt.error) {
            return cb(opt.error);
          }
          cb(null, opt && opt.tenant);
        });
        cbSpy = sandbox.spy();
      });
      after(function () {
        sandbox.restore();
      });

      it('should get from in memory cache', function () {
        // act: call without optional param
        client.getCurrentTenant({tenant: tenant}, cbSpy);
        client.getCurrentTenant({tenant: tenant}, cbSpy);

        getResourceStub.should.have.been
          .calledWith(currentTenantHref, {tenant: tenant}, Tenant, onCurrentTenantCb);
        cbSpy.should.be.calledWith(null, tenant);
        client._currentTenant.should.be.equal(tenant);

        /* jshint -W030 */
        getResourceStub.should.have.been.calledOnce;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */
      });
    });
  });

  describe('call to get resource', function () {
    var sandbox, client, getResourceStub, cbSpy;
    var href = '/boom!';
    before(function () {
      sandbox = sinon.sandbox.create();
      client = new Client({apiKey: apiKey});
      getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, ctor, cb) {
        cb();
      });
      cbSpy = sandbox.spy();
    });
    after(function () {
      sandbox.restore();
    });

    it('should call data store get resource', function () {
      client.getResource(href, Tenant, cbSpy);

      getResourceStub.should.have.been
        .calledWith(href, Tenant, cbSpy);

      /* jshint -W030 */
      getResourceStub.should.have.been.calledOnce;
      cbSpy.should.have.been.calledOnce;
      /* jshint +W030 */
    });
  });

  describe('call to create resource', function () {
    var sandbox, client, createResourceStub, cbSpy;
    var href = '/boom!';
    before(function () {
      sandbox = sinon.sandbox.create();
      client = new Client({apiKey: apiKey});
      createResourceStub = sandbox.stub(client._dataStore, 'createResource', function (href, data, ctor, cb) {
        cb();
      });
      cbSpy = sandbox.spy();
    });
    after(function () {
      sandbox.restore();
    });

    it('should call data store get resource', function () {
      client.createResource(href, {}, Tenant, cbSpy);

      createResourceStub.should.have.been
        .calledWith(href, {}, Tenant, cbSpy);

      /* jshint -W030 */
      createResourceStub.should.have.been.calledOnce;
      cbSpy.should.have.been.calledOnce;
      /* jshint +W030 */
    });
  });

  describe('call to get accounts', function() {
    var cbSpy, client, err, sandbox, tenant;
    var getCurrentTenantStub, getTenantAccounts;
    var returnError = false;

    before(function() {
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};
      client = new Client({ apiKey: apiKey });
      tenant = new Tenant({ href: 'boom!' }, client._dataStore);
      cbSpy = sandbox.spy();

      getCurrentTenantStub = sandbox.stub(client, 'getCurrentTenant', function(cb) {
        if (returnError) {
          return cb(err);
        }

        return cb(null, tenant);
      });

      getTenantAccounts = sandbox.stub(tenant, 'getAccounts', function(options, cb) {
        cb();
      });
    });

    after(function() {
      sandbox.restore();
    });

    it('should call tenant get applications', function() {
      client.getAccounts(cbSpy);
      client.getAccounts({}, cbSpy);

      getTenantAccounts.should.have.been.calledWith(null, cbSpy);
      getTenantAccounts.should.have.been.calledWith({}, cbSpy);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledTwice;
      getTenantAccounts.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should return error', function() {
      returnError = true;

      client.getAccounts(cbSpy);
      cbSpy.should.have.been.calledWith(err);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      getTenantAccounts.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to get applications', function () {
    var sandbox, client, getCurrentTenantStub, getTenantApplications,
      cbSpy, err, tenant;
    var returnError = false;
    before(function () {
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};
      client = new Client({apiKey: apiKey});
      tenant = new Tenant({href: 'boom!'}, client._dataStore);
      cbSpy = sandbox.spy();
      getCurrentTenantStub = sandbox.stub(client, 'getCurrentTenant', function(cb){
        if (returnError){
          return cb(err);
        }
        cb(null, tenant);
      });
      getTenantApplications = sandbox.stub(tenant, 'getApplications', function(options, cb){
        cb();
      });
    });
    after(function () {
      sandbox.restore();
    });

    it('should call tenant get applications', function () {
      // call without optional param
      client.getApplications(cbSpy);
      client.getApplications({}, cbSpy);

      getTenantApplications.should.have.been.calledWith(null, cbSpy);
      getTenantApplications.should.have.been.calledWith({}, cbSpy);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledTwice;
      getTenantApplications.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should return error', function(){
      returnError = true;
      client.getApplications(cbSpy);
      cbSpy.should.have.been.calledWith(err);
      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      getTenantApplications.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to create application', function () {
    var sandbox, client, getCurrentTenantStub, createTenantApplication,
      cbSpy, app, err, tenant;
    var returnError = false;
    before(function () {
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};app = {href: 'boom!'};
      client = new Client({apiKey: apiKey});
      tenant = new Tenant({href: 'boom!'}, client._dataStore);
      cbSpy = sandbox.spy();
      getCurrentTenantStub = sandbox.stub(client, 'getCurrentTenant', function(cb){
        if (returnError){
          return cb(err);
        }
        cb(null, tenant);
      });
      createTenantApplication = sandbox.stub(tenant, 'createApplication', function(app, options, cb){
        cb();
      });
    });
    after(function () {
      sandbox.restore();
    });

    it('should call tenant create applications', function () {
      // call without optional param
      client.createApplication(app, cbSpy);
      client.createApplication(app, {}, cbSpy);

      createTenantApplication.should.have.been.calledWith(app, null, cbSpy);
      createTenantApplication.should.have.been.calledWith(app, {}, cbSpy);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledTwice;
      createTenantApplication.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should return error', function(){
      returnError = true;
      client.createApplication(app, cbSpy);
      cbSpy.should.have.been.calledWith(err);
      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      createTenantApplication.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to get directories', function () {
    var sandbox, client, getCurrentTenantStub, getTenantDirectories,
      cbSpy, err, tenant;
    var returnError = false;
    before(function () {
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};
      client = new Client({apiKey: apiKey});
      tenant = new Tenant({href: 'boom!'}, client._dataStore);
      cbSpy = sandbox.spy();
      getCurrentTenantStub = sandbox.stub(client, 'getCurrentTenant', function(cb){
        if (returnError){
          return cb(err);
        }
        cb(null, tenant);
      });
      getTenantDirectories = sandbox.stub(tenant, 'getDirectories', function(options, cb){
        cb();
      });
    });
    after(function () {
      sandbox.restore();
    });

    it('should call tenant get applications', function () {
      // call without optional param
      client.getDirectories(cbSpy);
      client.getDirectories({}, cbSpy);

      getTenantDirectories.should.have.been.calledWith(null, cbSpy);
      getTenantDirectories.should.have.been.calledWith({}, cbSpy);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledTwice;
      getTenantDirectories.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should return error', function(){
      returnError = true;
      client.getDirectories(cbSpy);
      cbSpy.should.have.been.calledWith(err);
      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      getTenantDirectories.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to create Directory', function () {
    var sandbox, client, getCurrentTenantStub, createTenantDirectory,
      cbSpy, app, err, tenant;
    var returnError = false;
    before(function () {
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};app = {href: 'boom!'};
      client = new Client({apiKey: apiKey});
      tenant = new Tenant({href: 'boom!'}, client._dataStore);
      cbSpy = sandbox.spy();
      getCurrentTenantStub = sandbox.stub(client, 'getCurrentTenant', function(cb){
        if (returnError){
          return cb(err);
        }
        cb(null, tenant);
      });
      createTenantDirectory = sandbox.stub(tenant, 'createDirectory', function(app, options, cb){
        cb();
      });
    });
    after(function () {
      sandbox.restore();
    });

    it('should call tenant create applications', function () {
      // call without optional param
      client.createDirectory(app, cbSpy);
      client.createDirectory(app, {}, cbSpy);

      createTenantDirectory.should.have.been.calledWith(app, null, cbSpy);
      createTenantDirectory.should.have.been.calledWith(app, {}, cbSpy);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledTwice;
      createTenantDirectory.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should return error', function(){
      returnError = true;
      client.createDirectory(app, cbSpy);
      cbSpy.should.have.been.calledWith(err, null);
      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      createTenantDirectory.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to get account', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;
    before(function () {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = '/boom!';
      client = new Client({apiKey: apiKey});
      getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
        cb();
      });
      // call without optional param
      client.getAccount(href, cbSpy);
      // call with optional param
      client.getAccount(href, opt, cbSpy);
    });
    after(function () {
      sandbox.restore();
    });

    it('should get account', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, Account, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, Account, cbSpy);
    });
  });

  describe('call to get application', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;
    before(function () {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = '/boom!';
      client = new Client({apiKey: apiKey});
      getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
        cb();
      });
      // call without optional param
      client.getApplication(href, cbSpy);
      // call with optional param
      client.getApplication(href, opt, cbSpy);
    });
    after(function () {
      sandbox.restore();
    });

    it('should get application', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, Application, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, Application, cbSpy);
    });
  });

  describe('call to get directory', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;
    before(function () {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = '/boom!';
      client = new Client({apiKey: apiKey});
      getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
        cb();
      });
      // call without optional param
      client.getDirectory(href, cbSpy);
      // call with optional param
      client.getDirectory(href, opt, cbSpy);
    });
    after(function () {
      sandbox.restore();
    });

    it('should get directory', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, Directory, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, Directory, cbSpy);
    });
  });
  describe('call to get group', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;
    before(function () {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = '/boom!';
      client = new Client({apiKey: apiKey});
      getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
        cb();
      });
      // call without optional param
      client.getGroup(href, cbSpy);
      // call with optional param
      client.getGroup(href, opt, cbSpy);
    });
    after(function () {
      sandbox.restore();
    });

    it('should get group', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, Group, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, Group, cbSpy);
    });
  });
  describe('call to get group membership', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;
    before(function () {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = '/boom!';
      client = new Client({apiKey: apiKey});
      getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
        cb();
      });
      // call without optional param
      client.getGroupMembership(href, cbSpy);
      // call with optional param
      client.getGroupMembership(href, opt, cbSpy);
    });
    after(function () {
      sandbox.restore();
    });

    it('should get group', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, GroupMembership, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, GroupMembership, cbSpy);
    });
  });
});
