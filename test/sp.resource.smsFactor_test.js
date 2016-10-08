'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var Factor = require('../lib/resource/Factor');
var SmsFactor = require('../lib/resource/SmsFactor');
var DataStore = require('../lib/ds/DataStore');
var Phone = require('../lib/resource/Phone');

var factorData = {
  href: 'https://api.stormpath.com/v1/factors/wzU29J38OcAyY1z8TeX1x',
  type: 'SMS',
  createdAt: '2016-09-22T17:58:09.645Z',
  modifiedAt: '2016-09-22T17:58:09.646Z',
  status: 'ENABLED',
  verificationStatus: 'UNVERIFIED',
  account: {
    href: 'https://api.stormpath.com/v1/accounts/3apenYvL0Z9v9spexample'
  },
  challenges: {
    href: 'https://api.stormpath.com/v1/factors/wzU29J38OcAyY1z8TeX1x/challenges'
  },
  phone: {
    href: 'https://api.stormpath.com/v1/phones/wzH415XWxM2MOJVciAfBF'
  },
  mostRecentChallenge: {
    href: 'https://api.stormpath.com/v1/challenges/wzYMCbEUJ5Nx4S7VRSMkX'
  }
};

describe('SmsFactor', function() {
  var sandbox;
  var factor;
  var dataStore;
  var superSpy;
  var getResourceStub;

  before(function() {
    sandbox = sinon.sandbox.create();
    dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    superSpy = sinon.spy(SmsFactor, 'super_');
    factor = new SmsFactor(factorData, dataStore);
    getResourceStub = sinon.stub(dataStore, 'getResource');
  });

  after(function() {
    sandbox.restore();
  });

  describe('inheritance', function() {
    it('should be an instance of Factor', function() {
      assert.instanceOf(factor, Factor);
    });

    it('should call super_ with the same arguments', function() {
      superSpy.should.have.been.calledWithExactly(factorData, dataStore);
    });
  });

  describe('SmsFactor#getPhone', function() {
    var options;
    var callback;

    before(function() {
      options = {q: 'boom!'};
      callback = sinon.spy();

      factor.getPhone(options, callback);
    });

    it('should call DataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(factorData.phone.href);
    });

    it('should pass the correct data to DataStore#getResource', function() {
      getResourceStub.args[0][1].should.equal(options);
    });

    it('should pass the correct constructor to DataStore#getResource', function() {
      getResourceStub.args[0][2].should.equal(Phone);
    });

    it('should pass the correct callback to DataStore#getResource', function() {
      getResourceStub.args[0][3].should.equal(callback);
    });
  });

});
