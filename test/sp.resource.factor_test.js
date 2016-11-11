'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var InstanceResource = require('../lib/resource/InstanceResource');
var Challenge = require('../lib/resource/Challenge');
var DataStore = require('../lib/ds/DataStore');
var Factor = require('../lib/resource/Factor');
var Account = require('../lib/resource/Account');

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

describe('Factor', function() {
  var sandbox;
  var dataStore;
  var getResourceStub;
  var superSpy;
  var factor;

  before(function() {
    dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    sandbox = sinon.sandbox.create();
    getResourceStub = sinon.stub(dataStore, 'getResource');
    superSpy = sandbox.spy(Factor, 'super_');
    factor = new Factor(factorData, dataStore);
  });

  after(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    it('should inherit from InstanceResource', function() {
      assert.instanceOf(factor, InstanceResource);
    });

    it('should call super_ with the same arguments', function() {
      /*jshint -W030 */
      superSpy.should.have.been.calledOnce;
      superSpy.should.have.been.calledWithExactly(factorData, dataStore);
      /*jshint +W030 */
    });
  });

  describe('Factor#getAccount', function() {
    var options;
    var callback;

    before(function() {
      options = {query: 'boom!'};
      callback = sinon.spy();

      factor.getAccount(options, callback);
    });

    it('should call DataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(factorData.account.href);
    });

    it('should pass the correct data to DataStore#getResource', function() {
      getResourceStub.args[0][1].should.equal(options);
    });

    it('should pass the correct constructor to DataStore#getResource', function() {
      getResourceStub.args[0][2].should.equal(Account);
    });

    it('should pass the correct callback to DataStore#getResource', function() {
      getResourceStub.args[0][3].should.equal(callback);
    });
  });

  describe('Factor#getChallenges', function() {
    var options;
    var callback;

    before(function() {
      options = {query: 'boom!'};
      callback = sinon.spy();

      factor.getChallenges(options, callback);
    });

    it('should call DataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#getResource', function() {
      getResourceStub.args[1][0].should.equal(factorData.challenges.href);
    });

    it('should pass the correct data to DataStore#getResource', function() {
      getResourceStub.args[1][1].should.equal(options);
    });

    it('should pass the correct constructor to DataStore#getResource', function() {
      getResourceStub.args[1][2].should.equal(Challenge);
    });

    it('should pass the correct callback to DataStore#getResource', function() {
      getResourceStub.args[1][3].should.equal(callback);
    });
  });

  describe('Factor#getMostRecentChallenge', function() {
    describe('when there is one', function() {
      var options;
      var callback;

      before(function() {
        options = {query: 'boom!'};
        callback = sinon.spy();

        factor.getMostRecentChallenge(options, callback);
      });

      it('should call DataStore#getResource', function() {
        /*jshint -W030 */
        getResourceStub.should.have.been.calledThrice;
        /*jshint +W030 */
      });

      it('should pass the correct href to DataStore#getResource', function() {
        getResourceStub.args[2][0].should.equal(factorData.mostRecentChallenge.href);
      });

      it('should pass the correct data to DataStore#getResource', function() {
        getResourceStub.args[2][1].should.equal(options);
      });

      it('should pass the correct constructor to DataStore#getResource', function() {
        getResourceStub.args[2][2].should.equal(Challenge);
      });

      it('should pass the correct callback to DataStore#getResource', function() {
        getResourceStub.args[2][3].should.equal(callback);
      });
    });

    describe('when there is no challenge', function() {
      var factor2;
      var options;
      var callback;

      before(function() {
        factor2 = new Factor({
          mostRecentChallenge: null
        }, dataStore);
        options = {query: 'boom!'};
        callback = sinon.spy();

        factor2.getMostRecentChallenge(options, callback);
      });

      it('should not call DataStore#getResource', function() {
        /*jshint -W030 */
        assert.isFalse(getResourceStub.callCount === 4);
        /*jshint +W030 */
      });

      it('should call the callback with null as the second argument', function() {
        /*jshint -W030 */
        callback.should.have.been.called;
        assert.isNull(callback.args[0][1]);
        /*jshint +W030 */
      });
    });
  });
});
