var common = require('./common');
var tmp = require('tmp');
var fs = require('fs');
var assert = common.assert;
var sinon = common.sinon;
var expect = common.expect;

var Account = require('../lib/resource/Account');
var Application = require('../lib/resource/Application');
var ApiKey = require('../lib/resource/ApiKey');
var Challenge = require('../lib/resource/Challenge');
var Client = require('../lib/Client');
var DataStore = require('../lib/ds/DataStore');
var Directory = require('../lib/resource/Directory');
var FactorCtor = require('../lib/resource/FactorInstantiator').Constructor;
var Group = require('../lib/resource/Group');
var GroupMembership = require('../lib/resource/GroupMembership');
var Phone = require('../lib/resource/Phone');
var SmtpServer = require('../lib/resource/SmtpServer');
var Tenant = require('../lib/resource/Tenant');


function makeTestClient (options) {
  return new Client(options);
}

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
  var apiKey;

  before(function () {
    apiKey = {id: 1, secret: 2};
  });

  describe('constructor', function () {
    var client;

    before(function (done) {
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        done();
      });
    });

    it('should create data store', function () {
      client._dataStore.should.be.an.instanceof(DataStore);
    });
    it('should init private current tenant field', function () {
      /* jshint -W030 */
      expect(client._currentTenant).to.be.null;
      /* jshint +W030 */
    });
    it('should use the public api as the default base url',function(done){
      // temporarily unset any environment provided url
      var oldValue = process.env.STORMPATH_CLIENT_BASEURL;
      delete process.env.STORMPATH_CLIENT_BASEURL;
      var client = makeTestClient({apiKey: apiKey});
      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        expect(client._dataStore.requestExecutor.baseUrl).to.equal('https://api.stormpath.com/v1');
        // restore environment value
        if (oldValue) {
          process.env.STORMPATH_CLIENT_BASEURL = oldValue;
        } else {
          delete process.env.STORMPATH_CLIENT_BASEURL;
        }
        done();
      });

    });
    it('should allow me to change the base url through the constructor',function(done){
      // temporarily unset any environment provided url
      var oldValue = process.env.STORMPATH_CLIENT_BASEURL;
      delete process.env.STORMPATH_CLIENT_BASEURL;

      var url = 'http://api.example.com/';
      var client = makeTestClient({apiKey: apiKey, baseUrl: url});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        expect(client._dataStore.requestExecutor.baseUrl).to.equal(url);
        // restore environment value
        if (oldValue) {
          process.env.STORMPATH_CLIENT_BASEURL = oldValue;
        } else {
          delete process.env.STORMPATH_CLIENT_BASEURL;
        }
        done();
      });
    });

    it('should allow me to change the base url through the environment',function(done){
      // temporarily set a new environment provided url, save the old one if it exists
      var oldValue = process.env.STORMPATH_CLIENT_BASEURL;

      process.env.STORMPATH_CLIENT_BASEURL = 'https://foo/v1';

      var client = makeTestClient({apiKey: apiKey });

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        expect(client._dataStore.requestExecutor.baseUrl).to.equal('https://foo/v1');
        // restore environment value
        if (oldValue) {
          process.env.STORMPATH_CLIENT_BASEURL = oldValue;
        } else {
          delete process.env.STORMPATH_CLIENT_BASEURL;
        }
        done();
      });
    });
  });

  describe('default constructor', function () {

    it('should emit a ready event with the client itself as the value', function(done) {
      var client = makeTestClient({
        client: {
          apiKey: { id: '1', secret: '2' }
        }
      });

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function(c) {
        assert.deepEqual(client.config.client, c.config.client);
        done();
      });
    });

    it('should error if it\'s an invalid properties file', function (done) {
      var resetEnvVars = clearEnvVars('STORMPATH_CLIENT_APIKEY_ID','STORMPATH_CLIENT_APIKEY_SECRET');
      var tmpobj = tmp.fileSync();

      fs.writeSync(tmpobj.fd,'yo');
      fs.closeSync(tmpobj.fd);

      var client = makeTestClient({
        client:{
          apiKey:{
            file: tmpobj.name
          }
        }
      });

      client.on('error', function (err) {
        resetEnvVars();
        assert(err && err.message.indexOf('Unable to read properties file:') === 0);
        done();
      });

      client.on('ready', function () {
        resetEnvVars();
        done();
      });
    });

    it('should populate api key id secret on the config object', function(done) {
      var resetEnvVars = clearEnvVars('STORMPATH_CLIENT_APIKEY_ID','STORMPATH_CLIENT_APIKEY_SECRET');
      var tmpobj = tmp.fileSync();

      fs.writeSync(tmpobj.fd,'apiKey.id=1\napiKey.secret=2');
      fs.closeSync(tmpobj.fd);

      var client = makeTestClient({
        client:{
          apiKey:{
            file: tmpobj.name
          }
        }
      });

      client.on('error', function (err) {
        resetEnvVars();
        throw err;
      });

      client.on('ready', function () {
        resetEnvVars();
        assert.equal(client.config.client.apiKey.id,'1');
        assert.equal(client.config.client.apiKey.secret,'2');
        done();
      });
    });
  });

  describe('with an invalid app href', function() {
    it('should fail', function (done) {
      var client = makeTestClient({
        application:{
          href: 'https://api.stormpath.com/v1/applications/blah'
        }
      });

      client.on('error', function(err) {
        assert.equal(err.status, 404);
        done();
      });

      client.on('ready', function () {
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
  //     var client = makeTestClient({
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
    describe('first call should get resource', function () {

      var sandbox, client, getResourceStub, cbSpy, err, tenant, onCurrentTenantCb;
      var currentTenantHref;

      before(function (done) {
        currentTenantHref = '/tenants/current';
        sandbox = sinon.sandbox.create();
        err = {error: 'boom!'};
        tenant = { href: 'foo'};
        client = makeTestClient({apiKey: apiKey});

        client.on('error', function (err) {
          throw err;
        });

        client.on('ready', function () {
          getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, opt, ctor, cb) {
            onCurrentTenantCb = cb;
            if (opt && opt.error) {
              return cb(opt.error);
            }
            cb(null, opt && opt.tenant);
          });
          cbSpy = sandbox.spy();
          done();
        });
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
      var currentTenantHref;

      before(function (done) {
        currentTenantHref = '/tenants/current';
        sandbox = sinon.sandbox.create();
        err = {error: 'boom!'};
        tenant = { href: 'foo'};
        client = makeTestClient({apiKey: apiKey});

        client.on('error', function (err) {
          throw err;
        });

        client.on('ready', function () {
          getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, opt, ctor, cb) {
            onCurrentTenantCb = cb;
            if (opt && opt.error) {
              return cb(opt.error);
            }
            cb(null, opt && opt.tenant);
          });
          cbSpy = sandbox.spy();
          done();
        });
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
    var href;

    before(function (done) {
      href = '/boom!';
      sandbox = sinon.sandbox.create();
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, ctor, cb) {
          cb();
        });

        cbSpy = sandbox.spy();

        done();
      });
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
    var href;

    before(function (done) {
      href = '/boom!';
      sandbox = sinon.sandbox.create();
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        createResourceStub = sandbox.stub(client._dataStore, 'createResource', function (href, data, ctor, cb) {
          cb();
        });

        cbSpy = sandbox.spy();

        done();
      });
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
    var returnError;

    before(function(done) {
      returnError = false;
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};

      client = makeTestClient({ apiKey: apiKey });

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
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

        done();
      });
    });

    after(function() {
      sandbox.restore();
    });

    it('should call tenant get accounts', function() {
      client.getAccounts(cbSpy);
      client.getAccounts({}, cbSpy);

      client.on('ready', function () {
        getTenantAccounts.should.have.been.calledWith(null, cbSpy);
        getTenantAccounts.should.have.been.calledWith({}, cbSpy);

        /* jshint -W030 */
        getCurrentTenantStub.should.have.been.calledTwice;
        getTenantAccounts.should.have.been.calledTwice;
        /* jshint +W030 */
      });
    });

    it('should return error', function() {
      returnError = true;

      client.getAccounts(cbSpy);

      client.on('ready', function () {
        cbSpy.should.have.been.calledWith(err);

        /* jshint -W030 */
        getCurrentTenantStub.should.have.been.calledThrice;
        getTenantAccounts.should.have.been.calledTwice;
        /* jshint +W030 */
      });
    });
  });

  describe('call to get groups', function() {
    var cbSpy, client, err, sandbox, tenant;
    var getCurrentTenantStub, getTenantGroups;
    var returnError;

    before(function (done) {
      returnError = false;
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};

      client = makeTestClient({ apiKey: apiKey });

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        tenant = new Tenant({ href: 'boom!' }, client._dataStore);
        cbSpy = sandbox.spy();

        getCurrentTenantStub = sandbox.stub(client, 'getCurrentTenant', function(cb) {
          if (returnError) {
            return cb(err);
          }

          return cb(null, tenant);
        });

        getTenantGroups = sandbox.stub(tenant, 'getGroups', function(options, cb) {
          cb();
        });

        done();
      });
    });

    after(function() {
      sandbox.restore();
    });

    it('should call tenant get groups', function() {
      client.getGroups(cbSpy);
      client.getGroups({}, cbSpy);

      getTenantGroups.should.have.been.calledWith(null, cbSpy);
      getTenantGroups.should.have.been.calledWith({}, cbSpy);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledTwice;
      getTenantGroups.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should return error', function() {
      returnError = true;

      client.getGroups(cbSpy);
      cbSpy.should.have.been.calledWith(err);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      getTenantGroups.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to get applications', function () {
    var sandbox, client, getCurrentTenantStub, getTenantApplications,
      cbSpy, err, tenant, returnError;

    before(function (done) {
      returnError = false;
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
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

        done();
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
      cbSpy, app, err, tenant, returnError;

    before(function (done) {
      returnError = false;
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};app = {href: 'boom!'};
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
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

        done();
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
      cbSpy, err, tenant, returnError;

    before(function (done) {
      returnError = false;
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
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

        done();
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
      cbSpy, app, err, tenant, returnError;

    before(function (done) {
      returnError = false;
      sandbox = sinon.sandbox.create();
      err = {error: 'boom!'};app = {href: 'boom!'};
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
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

        done();
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
      cbSpy.should.have.been.calledWith(err);
      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      createTenantDirectory.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to get challenge', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};
      href = 'http://boom!/challenges/';

      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });
        // call without optional param
        client.getChallenge(href, cbSpy);
        // call with optional param
        client.getChallenge(href, opt, cbSpy);

        done();
      });
    });

    after(function () {
      sandbox.restore();
    });

    it('should get challenge', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, Challenge, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, Challenge, cbSpy);
    });
  });


  describe('call to get factor', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};
      href = 'http://boom!/factors/';

      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });
        // call without optional param
        client.getFactor(href, cbSpy);
        // call with optional param
        client.getFactor(href, opt, cbSpy);

        done();
      });
    });

    after(function () {
      sandbox.restore();
    });

    it('should get factor', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, FactorCtor, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, FactorCtor, cbSpy);
    });
  });

  describe('call to get phone', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};
      href = 'http://boom!/phones/';

      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });
        // call without optional param
        client.getPhone(href, cbSpy);
        // call with optional param
        client.getPhone(href, opt, cbSpy);

        done();
      });
    });

    after(function () {
      sandbox.restore();
    });

    it('should get phone', function () {
      /* jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      cbSpy.should.have.been.calledTwice;
      /* jshint +W030 */

      // call without optional param
      getResourceStub.should.have.been
        .calledWith(href, null, Phone, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, Phone, cbSpy);
    });
  });

  describe('call to get account', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};
      href = 'http://boom!/accounts/';

      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });
        // call without optional param
        client.getAccount(href, cbSpy);
        // call with optional param
        client.getAccount(href, opt, cbSpy);

        done();
      });
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

  describe('call to get ApiKeyById', function () {
    var sandbox, client, getResourceStub, cbSpy, href;

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      href = '/apiKeys/foo';

      client = makeTestClient();

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });

        client.getApiKeyById('foo', null, cbSpy);

        done();
      });
    });

    after(function () {
      sandbox.restore();
    });

    it('should get account', function () {
      getResourceStub.should.have.been
        .calledWith(client._dataStore.requestExecutor.baseUrl + href, null, ApiKey, cbSpy);
    });
  });

  describe('call to get application', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;
    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};
      href = 'http://boom!/applications/';
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });

        // call without optional param
        client.getApplication(href, cbSpy);
        // call with optional param
        client.getApplication(href, opt, cbSpy);

        done();
      });
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

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = 'http://boom!/directories/';
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });

        // call without optional param
        client.getDirectory(href, cbSpy);
        // call with optional param
        client.getDirectory(href, opt, cbSpy);

        done();
      });
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

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = 'http://boom!/groups/';
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });

        // call without optional param
        client.getGroup(href, cbSpy);
        // call with optional param
        client.getGroup(href, opt, cbSpy);

        done();
      });
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
    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};href = 'http://boom!/groupMemberships/';

      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });

        // call without optional param
        client.getGroupMembership(href, cbSpy);
        // call with optional param
        client.getGroupMembership(href, opt, cbSpy);

        done();
      });
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

  describe('call to get id sites', function () {
    var sandbox, cbSpy, err, app, client, tenant, getCurrentTenantStub,
        getTenantIdSites, returnError;

    before(function (done) {
      sandbox = sinon.sandbox.create();

      err = {error: 'boom!'};
      app = {href: 'boom!'};
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        tenant = new Tenant({href: 'boom!'}, client._dataStore);
        cbSpy = sandbox.spy();

        getCurrentTenantStub = sandbox.stub(client, 'getCurrentTenant', function(cb){
          if (returnError) {
            return cb(err);
          }
          cb(null, tenant);
        });

        getTenantIdSites = sandbox.stub(tenant, 'getIdSites', function(options, cb) {
          cb();
        });

        done();
      });
    });

    after(function () {
      sandbox.restore();
    });

    it('should call tenant get id sites', function () {
      // call without optional param
      client.getIdSites(cbSpy);
      client.getIdSites({}, cbSpy);

      getTenantIdSites.should.have.been.calledWith(null, cbSpy);
      getTenantIdSites.should.have.been.calledWith({}, cbSpy);

      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledTwice;
      getTenantIdSites.should.have.been.calledTwice;
      /* jshint +W030 */
    });

    it('should return error', function(){
      returnError = true;
      client.getIdSites(cbSpy);
      cbSpy.should.have.been.calledWith(err);
      /* jshint -W030 */
      getCurrentTenantStub.should.have.been.calledThrice;
      getTenantIdSites.should.have.been.calledTwice;
      /* jshint +W030 */
    });
  });

  describe('call to getSmtpServer', function () {
    var sandbox, client, getResourceStub, cbSpy, href, opt;

    before(function (done) {
      sandbox = sinon.sandbox.create();
      cbSpy = sandbox.spy();
      opt = {};
      href = '/smtpServers/foo';
      client = makeTestClient({apiKey: apiKey});

      client.on('error', function (err) {
        throw err;
      });

      client.on('ready', function () {
        getResourceStub = sandbox.stub(client._dataStore, 'getResource', function (href, options, ctor, cb) {
          cb();
        });
        // call without optional param
        client.getSmtpServer(href, cbSpy);
        // call with optional param
        client.getSmtpServer(href, opt, cbSpy);

        done();
      });
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
        .calledWith(href, null, SmtpServer, cbSpy);
      // call with optional param
      getResourceStub.should.have.been
        .calledWith(href, opt, SmtpServer, cbSpy);
    });
  });
});
