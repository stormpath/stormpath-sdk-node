var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var AccountLinkingPolicy = require('../lib/resource/AccountLinkingPolicy');
var Tenant = require('../lib/resource/Tenant');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function() {
  describe('AccountLinkingPolicy resource class', function() {
    var dataStore;

    before(function() {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    });

    describe('Constructor', function() {
      it('should inherit from InstanceResource', function() {
        AccountLinkingPolicy.super_.name.should.equal('InstanceResource');
      });

      it('should *not* inherit the delete method', function() {
        var alp = new AccountLinkingPolicy({href: 'boom!'}, dataStore);
        assert.isUndefined(alp.delete);
      });
    });

    describe('methods', function() {
      var sandbox;
      var opts;
      var alpData;
      var alp;
      var getResourceStub;
      var cbSpy;

      before(function() {
        sandbox = sinon.sandbox.create();

        opts = {
          boom: 'of course'
        };

        alpData = {
          href: 'boom!',
          createdAt: '',
          modifiedAt: '',
          status: 'ENABLED',
          automaticProvisioning: 'ENABLED',
          matchingProperty: 'email',
          tenant: {
            href: 'boom!'
          }
        };

        alp = new AccountLinkingPolicy(alpData, dataStore);

        getResourceStub = sandbox.stub(dataStore, 'getResource', function(href, options, ctor, cb) {
          cb();
        });

        cbSpy = sandbox.spy();
      });

      after(function() {
        sandbox.restore();
      });

      describe('#getTenant()', function() {
        before(function() {
          alp.getTenant(cbSpy);
          alp.getTenant(opts, cbSpy);
        });

        it('should get the leftAccount resource', function() {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          getResourceStub.should.have.been.calledWith(
            'boom!',
            null,
            Tenant,
            cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            'boom!',
            opts,
            Tenant,
            cbSpy
          );
        });
      });
    });
  });
});
