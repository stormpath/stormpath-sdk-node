/* jshint -W030 */
var common = require('./common');
var sinon = common.sinon;
var assert = common.assert;
var DataStore = require('../lib/ds/DataStore');
var AccessToken = require('../lib/resource/AccessToken');
var Account = require('../lib/resource/Account');

describe('Resources: ', function() {
  var dataStore;

  before(function() {
    dataStore = new DataStore({
      client: {
        apiKey: {
          id: 1,
          secret: '6b2c3912-4779-49c1-81e7-23c204f43d2d'
        }
      }
    });
  });

  describe('AccessToken resource', function() {
    describe('structure and inheritance', function() {
      it('should inherit from Resource', function() {
        assert.ok(AccessToken.super_);
        assert.equal(AccessToken.super_.name, 'Resource');
      });

      it('should have a defined delete method', function() {
        var accessToken = new AccessToken({}, dataStore);

        assert.ok(accessToken.delete);
        assert.isFunction(accessToken.delete);
      });
    });

    describe('.getAccount()', function() {
      var sandbox;
      var getResourceStub;
      var cbSpy;
      var opts;
      var data;
      var accessToken;

      before(function() {
        sandbox = sinon.sandbox.create();
        getResourceStub = sinon.stub(dataStore, 'getResource', function(href, opts, ctor, cb) {
          return cb();
        });

        cbSpy = sinon.spy();

        opts = {q: 'boomExpand!'};

        data = {
          account: {
            href: 'boom!'
          }
        };

        accessToken = new AccessToken(data, dataStore);

        accessToken.getAccount(cbSpy);
        accessToken.getAccount(opts, cbSpy);
      });

      after(function() {
        sandbox.restore();
      });

      it('should get the account', function() {
        /* jshint -W030 */
        getResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        getResourceStub.should.have.been.calledWith('boom!', null, Account, cbSpy);
        getResourceStub.should.have.been.calledWith('boom!', opts, Account, cbSpy);
      });
    });
  });
});
