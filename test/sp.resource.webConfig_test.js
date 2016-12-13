'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var ApiKey = require('../lib/resource/ApiKey');
var Application = require('../lib/resource/Application');
var DataStore = require('../lib/ds/DataStore');
var InstanceResource = require('../lib/resource/InstanceResource');
var Tenant = require('../lib/resource/Tenant');
var WebConfig = require('../lib/resource/WebConfig');

var webConfigData = {
  href: 'https://api.stormpath.com/v1/applicationWebConfigs/14wIJqPVADzqMfjcY7DJ2p',
  createdAt: '2016-11-11T04:27:21.688Z',
  modifiedAt: '2016-12-13T14:20:02.958Z',
  dnsLabel: 'example-application',
  domainName: 'example-application.apps.stormpath.io',
  status: 'ENABLED',
  oauth2: {
    enabled: true
  },
  register: {
    enabled: true
  },
  login: {
    enabled: true
  },
  verifyEmail: {
    enabled: true
  },
  forgotPassword: {
    enabled: null
  },
  changePassword: {
    enabled: null
  },
  me: {
    enabled: true,
    expand: {
      providerData: false,
      applications: false,
      apiKeys: false,
      customData: false,
      groups: false,
      groupMemberships: false,
      directory: false,
      tenant: true
    }
  },
  signingApiKey: {
    href: 'https://api.stormpath.com/v1/apiKeys/3NQKZ6CLAE1QJAQFDS9B3WT81'
  },
  application: {
    href: 'https://api.stormpath.com/v1/applications/2jalCiSk81m0jjFCzQPVb8'
  },
  tenant: {
    href: 'https://api.stormpath.com/v1/tenants/3BDwQnZM0rtp1VJ0rWE8IC'
  }
};

describe('WebConfig resource', function() {
  var opts;

  before(function() {
    opts = {expand: 'something'};
  });

  describe('constructor', function() {
    var superSpy;
    var sandbox;
    var dataStore;
    var webConfig;

    before(function() {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
      webConfig = new WebConfig(webConfigData, dataStore);
      sandbox = sinon.sandbox.create();
      superSpy = sandbox.spy(WebConfig, 'super_');

      new WebConfig(webConfigData, dataStore);
    });

    after(function() {
      sandbox.restore();
    });

    it('should call super_ with the same arguments', function() {
      /*jshint -W030 */
      superSpy.should.have.been.calledOnce;
      superSpy.should.have.been.calledWithExactly(webConfigData, dataStore);
      /*jshint +W030 */
    });
  });

  describe('instantiation and inheritance', function() {
    var dataStore;
    var webConfig;

    before(function() {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
      webConfig = new WebConfig(webConfigData, dataStore);
    });

    it('should inherit from InstanceResource', function() {
      assert.instanceOf(webConfig, InstanceResource);
    });

    it('should be an instance of WebConfig', function() {
      assert.instanceOf(webConfig, WebConfig);
    });
  });

  describe('#getApplication(options, callback)', function() {
    var callback;
    var getResourceStub;
    var sandbox;
    var dataStore;
    var webConfig

    before(function() {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
      webConfig = new WebConfig(webConfigData, dataStore);
      sandbox = sinon.sandbox.create();
      getResourceStub = sinon.stub(dataStore, 'getResource');
      callback = sinon.spy();
      webConfig.getApplication(callback);
      webConfig.getApplication(opts, callback);
    });

    after(function() {
      sandbox.restore();
    });

    it('should call dataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      /*jshint +W030 */
    });

    it('should pass the correct href to dataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(webConfigData.application.href);
      getResourceStub.args[1][0].should.equal(webConfigData.application.href);
    });

    it('should pass expansion options, if passed, to dataStore#getResource', function() {
      assert.isNotOk(getResourceStub.args[0][1]);
      getResourceStub.args[1][1].should.equal(opts);
    });

    it('should pass the constructor for Application to dataStore#getResource', function() {
      getResourceStub.args[0][2].should.equal(Application);
      getResourceStub.args[1][2].should.equal(Application);
    });

    it('should pass the callback to dataStore#getResource', function() {
      getResourceStub.args[0][3].should.equal(callback);
      getResourceStub.args[1][3].should.equal(callback);
    });
  });

  describe('#getSigningApiKey(options, callback)', function() {
    var callback;
    var getResourceStub;
    var sandbox;
    var dataStore;
    var webConfig;

    before(function() {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
      webConfig = new WebConfig(webConfigData, dataStore);
      sandbox = sinon.sandbox.create();
      getResourceStub = sinon.stub(dataStore, 'getResource');
      callback = sinon.spy();
      webConfig.getSigningApiKey(callback);
      webConfig.getSigningApiKey(opts, callback);
    });

    after(function() {
      sandbox.restore();
    });

    it('should call dataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      /*jshint +W030 */
    });

    it('should pass the correct href to dataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(webConfigData.signingApiKey.href);
      getResourceStub.args[1][0].should.equal(webConfigData.signingApiKey.href);
    });

    it('should pass expansion options, if passed, to dataStore#getResource', function() {
      assert.isNotOk(getResourceStub.args[0][1]);
      getResourceStub.args[1][1].should.equal(opts);
    });

    it('should pass the constructor for ApiKey to dataStore#getResource', function() {
      getResourceStub.args[0][2].should.equal(ApiKey);
      getResourceStub.args[1][2].should.equal(ApiKey);
    });

    it('should pass the callback to dataStore#getResource', function() {
      getResourceStub.args[0][3].should.equal(callback);
      getResourceStub.args[1][3].should.equal(callback);
    });
  });

  describe('#getTenant(options, callback)', function() {
    var callback;
    var getResourceStub;
    var sandbox;
    var dataStore;
    var webConfig;

    before(function() {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
      webConfig = new WebConfig(webConfigData, dataStore);
      sandbox = sinon.sandbox.create();
      getResourceStub = sinon.stub(dataStore, 'getResource');
      callback = sinon.spy();
      webConfig.getTenant(callback);
      webConfig.getTenant(opts, callback);
    });

    after(function() {
      sandbox.restore();
    });

    it('should call dataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      /*jshint +W030 */
    });

    it('should pass the correct href to dataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(webConfigData.tenant.href);
      getResourceStub.args[1][0].should.equal(webConfigData.tenant.href);
    });

    it('should pass expansion options, if passed, to dataStore#getResource', function() {
      assert.isNotOk(getResourceStub.args[0][1]);
      getResourceStub.args[1][1].should.equal(opts);
    });

    it('should pass the constructor for Tenant to dataStore#getResource', function() {
      getResourceStub.args[0][2].should.equal(Tenant);
      getResourceStub.args[1][2].should.equal(Tenant);
    });

    it('should pass the callback to dataStore#getResource', function() {
      getResourceStub.args[0][3].should.equal(callback);
      getResourceStub.args[1][3].should.equal(callback);
    });
  });
});
