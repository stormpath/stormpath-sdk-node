var common = require('./common');
var assert = common.assert;
var sinon = common.sinon;

var Account = require('../lib/resource/Account');
var AccountLink = require('../lib/resource/AccountLink');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function() {
  describe('AccountLink resource class', function() {
    var dataStore;

    before(function () {
      dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});
    });

    describe('Constructor', function() {
      it('should inherit from InstanceResource', function() {
        AccountLink.super_.name.should.equal('InstanceResource');
      });
    });

    describe('methods', function() {
      var sandbox;
      var opts;
      var accountLinkData;
      var accountLink;
      var getResourceStub;
      var cbSpy;

      before(function() {
        sandbox = sinon.sandbox.create();

        opts = {
          boom: 'of course'
        };

        accountLinkData = {
          href: 'boom!',
          createdAt: '',
          modifiedAt: '',
          leftAccount: {
            href: 'leftBoom!'
          },
          rightAccount: {
            href: 'rightBoom!'
          }
        };

        accountLink = new AccountLink(accountLinkData, dataStore);

        getResourceStub = sandbox.stub(dataStore, 'getResource', function(href, options, ctor, cb) {
          cb();
        });

        cbSpy = sandbox.spy();
      });

      after(function() {
        sandbox.restore();
      });

      describe('#getLeftAccount()', function() {
        before(function() {
          accountLink.getLeftAccount(cbSpy);
          accountLink.getLeftAccount(opts, cbSpy);
        });

        it('should get the leftAccount resource', function() {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          getResourceStub.should.have.been.calledWith(
            'leftBoom!',
            null,
            Account,
            cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            'leftBoom!',
            opts,
            Account,
            cbSpy
          );
        });
      });

      describe('#getRightAccount()', function() {
        before(function() {
          accountLink.getRightAccount(cbSpy);
          accountLink.getRightAccount(opts, cbSpy);
        });

        it('should get the rightAccount resource', function() {
          assert.equal(getResourceStub.callCount, 4);
          assert.equal(cbSpy.callCount, 4);

          getResourceStub.should.have.been.calledWith(
            'rightBoom!',
            null,
            Account,
            cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            'rightBoom!',
            opts,
            Account,
            cbSpy
          );
        });
      });
    });
  });
});
