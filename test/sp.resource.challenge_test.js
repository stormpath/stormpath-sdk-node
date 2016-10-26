'use strict';

var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var Resource = require('../lib/resource/Resource');
var Challenge = require('../lib/resource/Challenge');
var DataStore = require('../lib/ds/DataStore');
var FactorInstantiator = require('../lib/resource/FactorInstantiator').Constructor;
var Account = require('../lib/resource/Account');

var challengeData = {
  href: 'https://api.stormpath.com/v1/challenges/EGDIpcgffklwo6HywNzTw',
  createdAt: '2016-09-22T22:50:59.241Z',
  modifiedAt: '2016-09-22T22:50:59.241Z',
  status: 'SUCCESS',
  account: {
    href: 'https://api.stormpath.com/v1/accounts/5IvkjoqcYNe3TYMExample'
  },
  factor: {
    href: 'https://api.stormpath.com/v1/factors/4KOeu7ypRQI8Bpk2org7tk'
  }
};

describe('Challenge', function() {
  var sandbox;
  var dataStore;
  var getResourceStub;
  var createResourceStub;
  var superSpy;
  var challenge;

  before(function() {
    dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    sandbox = sinon.sandbox.create();
    getResourceStub = sinon.stub(dataStore, 'getResource');
    createResourceStub = sinon.stub(dataStore, 'createResource');
    superSpy = sandbox.spy(Challenge, 'super_');
    challenge = new Challenge(challengeData, dataStore);
  });

  after(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    it('should inherit from Resource', function() {
      assert.instanceOf(challenge, Resource);
    });

    it('should call super_ with the same arguments', function() {
      /*jshint -W030 */
      superSpy.should.have.been.calledOnce;
      superSpy.should.have.been.calledWithExactly(challengeData, dataStore);
      /*jshint +W030 */
    });
  });

  it('should have a save method', function() {
    assert.isDefined(challenge.save);
    assert.isFunction(challenge.save);
  });

  describe('Challenge#getAccount', function() {
    var options;
    var callback;

    before(function() {
      options = {query: 'boom!'};
      callback = sinon.spy();

      challenge.getAccount(options, callback);
    });

    it('should call DataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#getResource', function() {
      getResourceStub.args[0][0].should.equal(challengeData.account.href);
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

  describe('Challenge#getFactor', function() {
    var options;
    var callback;

    before(function() {
      options = {query: 'boom!'};
      callback = sinon.spy();

      challenge.getFactor(options, callback);
    });

    it('should call DataStore#getResource', function() {
      /*jshint -W030 */
      getResourceStub.should.have.been.calledTwice;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#getResource', function() {
      getResourceStub.args[1][0].should.equal(challengeData.factor.href);
    });

    it('should pass the query options to DataStore#getResource', function() {
      getResourceStub.args[1][1].should.equal(options);
    });

    it('should pass the correct constructor to DataStore#getResource', function() {
      getResourceStub.args[1][2].should.equal(FactorInstantiator);
    });

    it('should pass the correct callback to DataStore#getResource', function() {
      getResourceStub.args[1][3].should.equal(callback);
    });
  });

  describe('Challenge#verifyCode(code,callback)', function() {
    var code;
    var callback;

    before(function() {
      code = '12345';
      callback = sinon.spy();

      challenge.verifyCode(code, callback);
    });

    it('should call DataStore#createResource', function() {
      /*jshint -W030 */
      createResourceStub.should.have.been.calledOnce;
      /*jshint +W030 */
    });

    it('should pass the correct href to DataStore#createResource', function() {
      createResourceStub.args[0][0].should.equal(challenge.href);
    });

    it('should pass null query options to DataStore#createResource', function() {
      assert.isNull(createResourceStub.args[0][1]);
    });

    it('should pass the correct code to DataStore#createResource', function() {
      createResourceStub.args[0][2].should.have.property('code', code);
    });

    it('should pass the correct constructor to DataStore#createResource', function() {
      createResourceStub.args[0][3].should.eql(Challenge);
    });

    it('should pass the correct callback to DataStore#createResource', function() {
      createResourceStub.args[0][4].should.equal(callback);
    });
  });

  describe('Challenge#verifyCode(code,options,callback)', function() {
    var options = {};

    before(function() {
      challenge.verifyCode('12345', options, sinon.spy());
    });

    it('should pass the query options to DataStore#createResource', function() {
      assert.equal(createResourceStub.args[1][1], options);
    });
  });
});
