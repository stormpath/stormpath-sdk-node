'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var Factor = require('../lib/resource/Factor');
var GoogleAuthenticatorFactor = require('../lib/resource/GoogleAuthenticatorFactor');

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

  before(function() {
    dataStore = {};
    superSpy = sinon.spy(GoogleAuthenticatorFactor, 'super_');
    factor = new GoogleAuthenticatorFactor(factorData, dataStore);
  });

  it('should inherit from Factor', function() {
    assert.instanceOf(factor, Factor);
  });

  it('should call super_ with the same parameters', function() {
    superSpy.should.have.been.calledWithExactly(factorData, dataStore);
  });
});
