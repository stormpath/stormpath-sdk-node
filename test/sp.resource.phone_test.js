'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var InstanceResource = require('../lib/resource/InstanceResource');
var DataStore = require('../lib/ds/DataStore');
var Phone = require('../lib/resource/Phone');
var Account = require('../lib/resource/Account');

var phoneData = {
  href: 'https://api.stormpath.com/v1/phones/7lHGSpTvuxNnvnCkpOwUiR',
  createdAt: '2016-09-22T16:52:50.136Z',
  modifiedAt: '2016-09-22T16:52:50.136Z',
  number: '+12675555555',
  description: null,
  name: null,
  verificationStatus: 'UNVERIFIED',
  status: 'ENABLED',
  account: {
    href: 'https://api.stormpath.com/v1/accounts/3apenYvL0Z9v9spexaMple'
  }
};

describe('Phone resource', function() {
  var sandbox;
  var dataStore;
  var phone;
  var getResourceStub;

  before(function() {
    dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    sandbox = sinon.sandbox.create();
    getResourceStub = sinon.stub(dataStore, 'getResource');
    phone = new Phone(phoneData, dataStore);
  });

  after(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    var superSpy;

    before(function() {
      superSpy = sandbox.spy(Phone, 'super_');

      new Phone(phoneData, dataStore);
    });

    it('should call super_ with the same arguments', function() {
      /*jshint -W030 */
      superSpy.should.have.been.calledOnce;
      superSpy.should.have.been.calledWithExactly(phoneData, dataStore);
      /*jshint +W030 */
    });
  });

  describe('instantiation and inheritance', function() {
    it('should inherit from InstanceResource', function() {
      assert.instanceOf(phone, InstanceResource);
    });

    it('should be an instance of Phone', function() {
      assert.instanceOf(phone, Phone);
    });
  });

  describe('#getAccount(options, callback)', function() {
    var callback;

    before(function() {
      callback = sinon.spy();
      phone.getAccount(callback);
    });

    it('should call dataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to dataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(phoneData.account.href);
    });

    it('should pass no options to dataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.args[0][1].should.be.empty;
      /*jshint +W030 */
    });

    it('should pass the constructor for Account to dataStore#getResource', function() {
      getResourceStub.args[0][2].should.equal(Account);
    });

    it('should pass the callback to dataStore#getResource', function() {
      getResourceStub.args[0][3].should.equal(callback);
    });
  });
});
