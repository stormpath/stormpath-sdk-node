/* jshint -W030 */
var common = require('./common');
var sinon = common.sinon;
var nock = common.nock;
var u = common.u;

var Group = require('../lib/resource/Group');
var Account = require('../lib/resource/Account');
var DataStore = require('../lib/ds/DataStore');
var CustomData = require('../lib/resource/CustomData');
var instantiate = require('../lib/resource/ResourceFactory').instantiate;
var ProviderData = require('../lib/resource/ProviderData');
var GroupMembership = require('../lib/resource/GroupMembership');


describe('Resources: ', function () {
  "use strict";
  describe('Account resource class', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});

    describe('get groups', function () {
      describe('if groups not set', function () {
        var account = new Account(dataStore);

        function getGroupsWithoutHref() {
          account.getGroups();
        }

        it('should throw unhandled exception', function () {
          getGroupsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if groups set', function () {
        var sandbox, account, getResourceStub, cbSpy, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          opt = {};
          account = new Account({groups: {href: 'boom!'}}, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource',
            function (href, options, ctor, cb) {
              cb();
            });
          cbSpy = sandbox.spy();

          // call without optional param
          account.getGroups(cbSpy);
          // call with optional param
          account.getGroups(opt, cbSpy);
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
          getResourceStub.should.have.been.calledWith('boom!', null, Group, cbSpy);
          // call with optional param
          getResourceStub.should.have.been.calledWith('boom!', opt, Group, cbSpy);
        });
      });
    });

    describe('get group membership', function () {
      describe('if group membership not set', function () {
        var account = new Account(dataStore);

        function getGroupMembershipsWithoutHref() {
          account.getGroupMemberships();
        }

        it('should throw unhandled exception', function () {
          getGroupMembershipsWithoutHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if group membership is set', function () {
        var sandbox, account, getResourceStub, cbSpy, opt;
        before(function () {
          sandbox = sinon.sandbox.create();
          opt = {};
          account = new Account({groupMemberships: {href: 'boom!'}}, dataStore);
          getResourceStub = sandbox.stub(dataStore, 'getResource',
            function (href, options, ctor, cb) {
              cb();
            });
          cbSpy = sandbox.spy();

          // call without optional param
          account.getGroupMemberships(cbSpy);
          // call with optional param
          account.getGroupMemberships(opt, cbSpy);
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
          getResourceStub.should.have.been.calledWith('boom!', null, GroupMembership, cbSpy);
          // call with optional param
          getResourceStub.should.have.been.calledWith('boom!', opt, GroupMembership, cbSpy);
        });
      });
    });

    describe('add to group', function () {
      describe('if group href not set', function () {
        var account = new Account(dataStore);

        function addToGroupWithoutGroupHref() {
          account.addToGroup();
        }

        it('should throw unhandled exception', function () {
          addToGroupWithoutGroupHref.should
            .throw(/cannot read property 'href' of undefined/i);
        });
      });

      describe('if group href is set', function () {
        var sandbox, account, createResourceStub, cbSpy, acc, opt;
        var group = {href: 'boom1!'};
        var groupHref = 'boom2!';
        var createGroupMembershipHref = '/groupMemberships';
        before(function () {
          sandbox = sinon.sandbox.create();
          opt = {};
          acc = {href: 'acc_boom', groupMemberships: {href: 'boom!'}};
          account = new Account(acc, dataStore);
          createResourceStub = sandbox.stub(dataStore, 'createResource',
            function (href, options, member, ctor, cb) {
              cb();
            });
          cbSpy = sandbox.spy();

          // call without optional param
          account.addToGroup(group, cbSpy);
          account.addToGroup(groupHref, cbSpy);
          // call with optional param
          account.addToGroup(group, opt, cbSpy);
          account.addToGroup(groupHref, opt, cbSpy);
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
                account: {href: acc.href},
                group: group
              },
              GroupMembership,
              cbSpy);

          createResourceStub.should.have.been
            .calledWith(
              createGroupMembershipHref,
              null,
              {
                account: {href: acc.href},
                group: {href: groupHref}
              },
              GroupMembership,
              cbSpy);
          // call with optional param
          createResourceStub.should.have.been
            .calledWith(
              createGroupMembershipHref,
              opt,
              {
                account: {href: acc.href},
                group: group
              },
              GroupMembership,
              cbSpy);

          createResourceStub.should.have.been
            .calledWith(
              createGroupMembershipHref,
              opt,
              {
                account: {href: acc.href},
                group: {href: groupHref}
              },
              GroupMembership,
              cbSpy);
        });
      });
    });

    describe('custom data', function(){
      var sandbox, account, accountJSON;
      before(function () {
        sandbox = sinon.sandbox.create();
        // arrange
        accountJSON = {
          href: 'account_href',
          customData: {href: 'custom_data_href'}
        };
        // act
        account = instantiate(Account, accountJSON, null, dataStore);
      });
      after(function () {
        sandbox.restore();
      });
      it('should wrap account field customData in CustomData class', function(){
        // assert
        account.customData.should.be.an.instanceOf(CustomData);
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
          var sandbox, account, getResourceStub, cbSpy, opt;
          before(function () {
            sandbox = sinon.sandbox.create();
            opt = {};
            account = new Account({customData: {href: 'boom!'}}, dataStore);
            getResourceStub = sandbox.stub(dataStore, 'getResource',
              function (href, options, ctor, cb) {
                cb();
              });
            cbSpy = sandbox.spy();

            // call without optional param
            account.getCustomData(cbSpy);
            // call with optional param
            account.getCustomData(opt, cbSpy);
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

    describe('get provider data', function(){
      function getProviderData(data) {
        return function () {
          var accObj, providerDataObj, app, providerData;
          before(function (done) {
            // assert
            providerDataObj = {href: '/provider/data/href', name: 'provider name'};
            accObj = {providerData: {href: providerDataObj.href}};
            app = new Account(accObj, dataStore);

            nock(u.BASE_URL).get(u.v1(providerDataObj.href)).reply(200, providerDataObj);

            var args = [];
            if (data) {
              args.push(data);
            }
            args.push(function cb(err, pd) {
              providerData = pd;
              done();
            });

            // act
            app.getProviderData.apply(app, args);
          });

          it('should get provider data', function () {
            providerData.href.should.be.equal(providerData.href);
            providerData.name.should.be.equal(providerData.name);
          });

          it('should be an instance of ProviderData', function () {
            providerData.should.be.an.instanceOf(ProviderData);
          });
        };
      }

      describe('without options', getProviderData());
      describe('with options', getProviderData({}));
      describe('if provider data not set', function () {
        var accObj, app, cbSpy;
        before(function () {
          // assert
          accObj = {providerData: null};
          app = new Account(accObj, dataStore);
          cbSpy = sinon.spy();

          // act
          app.getProviderData(cbSpy);
        });

        it('should call cb without options', function () {
          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWith(undefined, undefined);
        });
      });
    });
  });
});