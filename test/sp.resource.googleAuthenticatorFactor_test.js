'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var Factor = require('../lib/resource/Factor');
var GoogleAuthenticatorFactor = require('../lib/resource/GoogleAuthenticatorFactor');
var DataStore = require('../lib/ds/DataStore');
var Challenge = require('../lib/resource/Challenge');

var factorData = {
  href: 'https://api.stormpath.com/v1/factors/wzU29J38OcAyY1z8TeX1x',
  type: 'google-authenticator',
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
  mostRecentChallenge: {
    href: 'https://api.stormpath.com/v1/challenges/wzYMCbEUJ5Nx4S7VRSMkX'
  }
};

describe('GoogleAuthenticatorFactor', function() {
  var dataStore;
  var factor;
  var superSpy;
  var createResourceStub;

  before(function() {
    dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    superSpy = sinon.spy(GoogleAuthenticatorFactor, 'super_');
    factor = new GoogleAuthenticatorFactor(factorData, dataStore);
    createResourceStub = sinon.stub(dataStore, 'createResource');
  });

  it('should inherit from Factor', function() {
    assert.instanceOf(factor, Factor);
  });

  it('should call super_ with the same parameters', function() {
    superSpy.should.have.been.calledWithExactly(factorData, dataStore);
  });

  describe('GoogleAuthenticatorFactor#createChallenge', function() {
    var callback;
    var options = {};

    before(function() {
      callback = sinon.spy();

      factor.createChallenge(options, callback);
    });

    it('should call DataStore#createResource', function() {
      /*jshint -W030 */
      createResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#createResource', function() {
      createResourceStub.args[0][0].should.equal(factorData.challenges.href);
    });

    it('should pass options to DataStore#createResource', function() {
      assert.equal(createResourceStub.args[0][1], options);
    });

    it('should not pass a request body to DataStore#createResource', function() {
      assert.isNull(createResourceStub.args[0][2]);
    });

    it('should pass the correct constructor to DataStore#createResource', function() {
      createResourceStub.args[0][3].should.equal(Challenge);
    });

    it('should pass the correct callback to DataStore#createResource', function() {
      createResourceStub.args[0][4].should.equal(callback);
    });
  });
});
