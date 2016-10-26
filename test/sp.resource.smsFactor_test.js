'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var Factor = require('../lib/resource/Factor');
var SmsFactor = require('../lib/resource/SmsFactor');
var DataStore = require('../lib/ds/DataStore');
var Phone = require('../lib/resource/Phone');
var Challenge = require('../lib/resource/Challenge');

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
  var createResourceStub;

  before(function() {
    sandbox = sinon.sandbox.create();
    dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    superSpy = sinon.spy(SmsFactor, 'super_');
    factor = new SmsFactor(factorData, dataStore);
    getResourceStub = sinon.stub(dataStore, 'getResource');
    createResourceStub = sinon.stub(dataStore, 'createResource');
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

  describe('SmsFactor#getPhone()', function() {
    var callback;

    before(function() {
      callback = sinon.spy();

      factor.getPhone(callback);
    });

    it('should call DataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(factorData.phone.href);
    });

    it('should pass no data to DataStore#getResource', function() {
      assert.isNull(getResourceStub.args[0][1]);
    });

    it('should pass the correct constructor to DataStore#getResource', function() {
      getResourceStub.args[0][2].should.equal(Phone);
    });

    it('should pass the correct callback to DataStore#getResource', function() {
      getResourceStub.args[0][3].should.equal(callback);
    });
  });

  describe('SmsFactor#getPhone(options)', function() {
    var options = {};

    before(function() {
      factor.getPhone(options, sinon.spy());
    });

    it('should pass options to DataStore#createResource', function() {
      assert.equal(getResourceStub.args[1][1], options);
    });
  });

  describe('SmsFactor#createChallenge', function() {
    var challenge;
    var options;
    var callback;

    before(function() {
      challenge = {name: 'challenge'};
      options = {query: 'boom!'};
      callback = sinon.spy();

      factor.createChallenge(challenge, options, callback);
    });

    it('should call DataStore#createResource', function() {
      /*jshint -W030 */
      createResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#createResource', function() {
      createResourceStub.args[0][0].should.equal(factorData.challenges.href);
    });

    it('should pass the correct options to DataStore#createResource', function() {
      createResourceStub.args[0][1].should.have.property('query', 'boom!');
    });

    it('should pass the correct data to DataStore#createResource', function() {
      createResourceStub.args[0][2].should.equal(challenge);
    });

    it('should pass the correct constructor to DataStore#createResource', function() {
      createResourceStub.args[0][3].should.equal(Challenge);
    });

    it('should pass the correct callback to DataStore#createResource', function() {
      createResourceStub.args[0][4].should.equal(callback);
    });
  });

});
