var common = require('./common');
var sinon = common.sinon;
var uuid = common.uuid;
var assert = common.assert;
var Group = require('../lib/resource/Group');
var Account = require('../lib/resource/Account');
var ApiKey = require('../lib/resource/ApiKey');
var DataStore = require('../lib/ds/DataStore');
var CustomData = require('../lib/resource/CustomData');
var instantiate = require('../lib/resource/ResourceFactory').instantiate;
var CollectionResource = require('../lib/resource/CollectionResource');
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

    describe('createApiKey',function () {
      var sandbox = sinon.sandbox.create();
      var accountHref = 'accounts/'+uuid();
      var result, requestedOptions;

      before(function(done){
        sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
          requestedOptions = requestOptions;
          cb(null,{
              "account": {
                "href": "https://api.stormpath.com/v1/accounts/8897"
              },
              "href": "https://api.stormpath.com/v1/apiKeys/5678",
              "id": "5678",
              "secret": "secret",
              "status": "ENABLED",
              "tenant": {
                "href": "https://api.stormpath.com/v1/tenants/abc123"
              }
            });
        });
        new Account({
          href:accountHref,
          apiKeys: {
            href: accountHref + '/apiKeys'
          }
        }, dataStore)
          .createApiKey(function(err,value) {
            result = [err,value];
            done();
          });
      });
      after(function(){
        sandbox.restore();
      });
      it('should have asked for encrypted secret',function(){
        assert.equal(requestedOptions.query.encryptSecret,true);
      });
      it('should not err',function(){
        assert.equal(result[0],null);
      });
      it('should return an ApiKey instance',function(){
        assert.instanceOf(result[1],ApiKey);
      });
    });

    describe('getApiKeys',function () {
      var sandbox = sinon.sandbox.create();
      var accountHref = 'accounts/'+uuid();
      var result, requestedOptions;

      before(function(done){
        sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
          requestedOptions = requestOptions;
          cb(null,{
            "href": "https://api.stormpath.com/v1/accounts/1234/apiKeys",
            "items": [
              {
                "href": "https://api.stormpath.com/v1/apiKeys/5678",
                "id": "5678",
                "secret": "secret",
                "status": "ENABLED"
              }
            ],
            "limit": 25,
            "offset": 0
          });
        });
        new Account({
          href:accountHref,
          apiKeys: {
            href: accountHref + '/apiKeys'
          }
        }, dataStore)
          .getApiKeys(function(err,value) {
            result = [err,value];
            done();
          });
      });
      after(function(){
        sandbox.restore();
      });
      it('should have asked for encrypted secret',function(){
        assert.equal(requestedOptions.query.encryptSecret,true);
      });
      it('should not err',function(){
        assert.equal(result[0],null);
      });
      it('should return a collection resource',function(){
        assert.instanceOf(result[1],CollectionResource);
      });
      it('should return ApiKey instances',function(){
        assert.instanceOf(result[1].items[0],ApiKey);
      });
    });
  });


});