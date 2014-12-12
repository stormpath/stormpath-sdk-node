var common = require('./common');
var sinon = common.sinon;

var Group = require('../lib/resource/Group');
var GroupMembership = require('../lib/resource/GroupMembership');
var Account = require('../lib/resource/Account');
var DataStore = require('../lib/ds/DataStore');

describe('Resources: ', function () {
  describe('Group Membership resource', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});

    describe('get account', function () {
      describe('if group membership href not set', function () {
        var groupMembership = new GroupMembership();

        function getAccountWithoutHref() {
          groupMembership.getAccount();
        }

        it('should throw unhandled exception', function () {
          getAccountWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if group membership href are set', function () {
        var sandbox, groupMembership, getResourceStub, cbSpy, grp, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          grp = {groupMemberships: {href: 'boom!'}};
          opt = {};
          groupMembership = new GroupMembership({
            groupMemberships: { href: 'boom!' },
            account: new Account({ href: 'boom!', username: 'rdegges', email: 'r@rdegges.com', passsword: '0absfdgasAFDSDF!!!!', givenName: 'Randall', surname: 'Degges' }),
          }, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          groupMembership.getAccount(cbSpy);
          // call with optional param
          groupMembership.getAccount(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get account', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been
            .calledWith(grp.groupMemberships.href, null, Account, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(grp.groupMemberships.href, opt, Account, cbSpy);
        });
      });
    });

    describe('get group', function () {
      describe('if group membership href not set', function () {
        var groupMembership = new GroupMembership();

        function getAccountWithoutHref() {
          groupMembership.getGroup();
        }

        it('should throw unhandled exception', function () {
          getAccountWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if group membership href are set', function () {
        var sandbox, groupMembership, getResourceStub, cbSpy, grp, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          grp = {group: {href: 'boom!'}};
          opt = {};
          groupMembership = new GroupMembership(grp, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          groupMembership.getGroup(cbSpy);
          // call with optional param
          groupMembership.getGroup(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get account', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been
            .calledWith(grp.group.href, null, Group, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(grp.group.href, opt, Group, cbSpy);
        });
      });
    });
  });
});
