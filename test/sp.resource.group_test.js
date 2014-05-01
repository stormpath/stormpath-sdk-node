var common = require('./common');
var sinon = common.sinon;

var Group = require('../lib/resource/Group');

var Account = require('../lib/resource/Account');
var DataStore = require('../lib/ds/DataStore');
var CustomData = require('../lib/resource/CustomData');
var instantiate = require('../lib/resource/ResourceFactory').instantiate;
var GroupMembership = require('../lib/resource/GroupMembership');

describe('Resources: ', function () {
  "use strict";
  describe('Group resource', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});

    describe('add account', function () {
      describe('if group href not set', function () {
        var group = new Group(dataStore);

        function addAccountWithoutGroupHref() {
          group.addAccount();
        }

        it('should throw unhandled exception', function () {
          addAccountWithoutGroupHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if group href is set', function () {
        var sandbox, group, createResourceStub, cbSpy, grp, opt;
        var account = {href: 'boom1!'};
        var accountHref = 'boom2!';
        var createGroupMembershipHref = '/groupMemberships';
        before(function () {
          sandbox = sinon.sandbox.create();
          opt = {};
          grp = {href: 'acc_boom', groupMemberships: {href: 'boom!'}};
          group = new Group(grp, dataStore);
          createResourceStub = sandbox.stub(dataStore, 'createResource',
            function (href, options, member, ctor, cb) {
              cb();
            });
          cbSpy = sandbox.spy();

          // call without optional param
          group.addAccount(account, cbSpy);
          group.addAccount(accountHref, cbSpy);
          // call with optional param
          group.addAccount(account, opt, cbSpy);
          group.addAccount(accountHref, opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get groups resource', function () {
          createResourceStub.callCount.should.be.equal(4);
          cbSpy.callCount.should.be.equal(4);

          // call without optional param
          createResourceStub.should.have.been
            .calledWith(
            createGroupMembershipHref,
            null,
            {
              account: account,
              group: {href: grp.href}
            },
            GroupMembership,
            cbSpy);

          createResourceStub.should.have.been
            .calledWith(
            createGroupMembershipHref,
            null,
            {
              account: {href: accountHref},
              group: {href: grp.href}
            },
            GroupMembership,
            cbSpy);
          // call with optional param
          createResourceStub.should.have.been
            .calledWith(
            createGroupMembershipHref,
            opt,
            {
              account: account,
              group: {href: grp.href}
            },
            GroupMembership,
            cbSpy);

          createResourceStub.should.have.been
            .calledWith(
            createGroupMembershipHref,
            opt,
            {
              account: {href: accountHref},
              group: {href: grp.href}
            },
            GroupMembership,
            cbSpy);
        });
      });
    });

    describe('get accounts', function () {
      describe('if accounts not set', function () {
        var group = new Group();

        function getAccountsWithoutHref() {
          group.getAccounts();
        }

        it('should throw unhandled exception', function () {
          getAccountsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if accounts are set', function () {
        var sandbox, group, getResourceStub, cbSpy, grp, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          grp = {accounts: {href: 'boom!'}};
          opt = {};
          group = new Group(grp, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });
          cbSpy = sandbox.spy();

          // call without optional param
          group.getAccounts(cbSpy);
          // call with optional param
          group.getAccounts(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get accounts', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been
            .calledWith(grp.accounts.href, null, Account, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(grp.accounts.href, opt, Account, cbSpy);
        });
      });
    });

    describe('get account membership', function () {
      describe('if account membership not set', function () {
        var group = new Group(dataStore);

        function getAccountMembershipsWithoutHref() {
          group.getAccountMemberships();
        }

        it('should throw unhandled exception', function () {
          getAccountMembershipsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if account memberships is set', function () {
        var sandbox, group, getResourceStub, cbSpy, grp, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          opt = {};
          grp = {accountMemberships: {href: 'boom!'}};
          group = new Group(grp, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource',
            function (href, options, ctor, cb) {
              cb();
            });
          cbSpy = sandbox.spy();

          // call without optional param
          group.getAccountMemberships(cbSpy);
          // call with optional param
          group.getAccountMemberships(opt, cbSpy);
        });
        after(function () {
          sandbox.restore();
        });

        it('should get groups resource', function () {
          /* jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          /* jshint +W030 */

          // call without optional param
          getResourceStub.should.have.been
            .calledWith(grp.accountMemberships.href, null, GroupMembership, cbSpy);
          // call with optional param
          getResourceStub.should.have.been
            .calledWith(grp.accountMemberships.href, opt, GroupMembership, cbSpy);
        });
      });
    });

    describe('custom data', function(){
      var sandbox, group, groupJSON;
      before(function () {
        sandbox = sinon.sandbox.create();
        // arrange
        groupJSON = {
          href: 'group_href',
          customData: {href: 'custom_data_href'}
        };
        // act
        group = instantiate(Account, groupJSON, null, dataStore);
      });
      after(function () {
        sandbox.restore();
      });
      it('should wrap account field customData in CustomData class', function(){
        // assert
        group.customData.should.be.an.instanceOf(CustomData);
      });

      describe('get custom data', function () {
        describe('if custom data not set', function () {
          var account = new Account(dataStore);

          function getCustomDataWithoutHref() {
            account.getCustomData();
          }

          it('should throw unhandled exception', function () {
            getCustomDataWithoutHref.should
              .throw(/cannot read property 'href' of undefined/i);
          });
        });

        describe('if custom data set', function () {
          var sandbox, group, getResourceStub, cbSpy, opt;
          before(function () {
            sandbox = sinon.sandbox.create();
            opt = {};
            group = new Group({customData: {href: 'boom!'}}, dataStore);
            getResourceStub = sandbox.stub(dataStore, 'getResource',
              function (href, options, ctor, cb) {
                cb();
              });
            cbSpy = sandbox.spy();

            // call without optional param
            group.getCustomData(cbSpy);
            // call with optional param
            group.getCustomData(opt, cbSpy);
          });
          after(function () {
            sandbox.restore();
          });

          it('should get groups resource', function () {
            /* jshint -W030 */
            getResourceStub.should.have.been.calledTwice;
            cbSpy.should.have.been.calledTwice;
            /* jshint +W030 */

            // call without optional param
            getResourceStub.should.have.been.calledWith('boom!', null, CustomData, cbSpy);
            // call with optional param
            getResourceStub.should.have.been.calledWith('boom!', opt, CustomData, cbSpy);
          });
        });
      });
    });
  });
});
