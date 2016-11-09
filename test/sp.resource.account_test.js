/* jshint -W030 */
var common = require('./common');
var sinon = common.sinon;
var nock = common.nock;
var u = common.u;
var uuid = common.uuid;
var assert = common.assert;
var Group = require('../lib/resource/Group');
var Account = require('../lib/resource/Account');
var AccountLink = require('../lib/resource/AccountLink');
var ApiKey = require('../lib/resource/ApiKey');
var DataStore = require('../lib/ds/DataStore');
var CustomData = require('../lib/resource/CustomData');
var instantiate = require('../lib/resource/ResourceFactory').instantiate;
var ProviderData = require('../lib/resource/ProviderData');
var CollectionResource = require('../lib/resource/CollectionResource');
var GroupMembership = require('../lib/resource/GroupMembership');
var FactorInstantiator = require('../lib/resource/FactorInstantiator').Constructor;
var SmsFactor = require('../lib/resource/SmsFactor');
var Phone = require('../lib/resource/Phone');


describe('Resources: ', function () {
  "use strict";
  describe('Account resource class', function () {
    var dataStore;

    before(function () {
      dataStore = new DataStore({
        client: {
          apiKey: {
            id: 1,
            // this secret will decrypt the api keys correctly
            secret: '6b2c3912-4779-49c1-81e7-23c204f43d2d'
          }
        }
      });
    });

    describe('get groups', function () {
      describe('if groups not set', function () {
        var account;

        function getGroupsWithoutHref() {
          account.getGroups();
        }

        before(function () {
          account = new Account(dataStore);
        });

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
        var account;

        function getGroupMembershipsWithoutHref() {
          account.getGroupMemberships();
        }

        before(function () {
          account = new Account(dataStore);
        });

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
        var account;

        function addToGroupWithoutGroupHref() {
          account.addToGroup();
        }

        before(function () {
          account = new Account(dataStore);
        });

        it('should throw unhandled exception', function () {
          addToGroupWithoutGroupHref.should
            .throw(/cannot read property 'href' of null/i);
        });
      });

      describe('if group href is set', function () {
        var sandbox, account, createResourceStub, cbSpy, acc, opt;
        var group;
        var groupHref;
        var createGroupMembershipHref;

        before(function () {
          group = {href: 'boom1!'};
          groupHref = 'boom2!';
          createGroupMembershipHref = '/groupMemberships';

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
          var account;

          function getCustomDataWithoutHref() {
            account.getCustomData();
          }

          before(function () {
            account = new Account(dataStore);
          });

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

        it('should call cb without arguments', function () {
          cbSpy.should.have.been.calledOnce;
          cbSpy.should.have.been.calledWithExactly();
        });
      });
    });

    describe('createApiKey',function () {
      var sandbox;
      var accountHref;
      var result, cacheResult, requestedOptions;
      var creationResponse;
      var decryptedSecret;

      before(function(done){
        sandbox = sinon.sandbox.create();
        accountHref = 'accounts/' + uuid();
        decryptedSecret = 'rncdUXr2dtjjQ5OyDdWRHRxncRW7K0OnU6/Wqf2iqdQ';

        creationResponse = {
          'account': {
            'href': 'https://api.stormpath.com/v1/accounts/8897'
          },
          'href': 'https://api.stormpath.com/v1/apiKeys/5678',
          'id': '5678',
          'secret': 'NuUYYcIAjRYS+LiNBPhpu/p8iYP+jBltei1n1wxcMye3FTKRCTILpP/cD6Ynfvu6S4UokPM/SwuBaEn77aM3Ww==',
          'status': 'ENABLED',
          'tenant': {
            'href': 'https://api.stormpath.com/v1/tenants/abc123'
          }
        };

        sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
          requestedOptions = requestOptions;
          // hack - override the salt
          requestOptions.query.encryptionKeySalt = 'uHMSUA6F8LFoCIPqKYSRCg==';
          cb(null,creationResponse);
        });
        new Account({
          href:accountHref,
          apiKeys: {
            href: accountHref + '/apiKeys'
          }
        }, dataStore)
          .createApiKey(function(err,value) {
            result = [err,value];
            dataStore.cacheHandler.get(creationResponse.href,function(err,value){
              cacheResult = [err,value];
              done();
            });
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
      it('should cache the ApiKey',function(){
        assert.equal(cacheResult[1].href,creationResponse.href);
      });
      it('should store the encrypted key in the cache',function(){
        assert.equal(cacheResult[1].secret,creationResponse.secret);
      });
      it('should return the decrypted secret',function(){
        assert.equal(result[1].secret,decryptedSecret);
      });
    });

    describe('getApiKeys',function () {
      var sandbox;
      var accountHref;
      var result, requestedOptions;

      before(function(done){
        sandbox = sinon.sandbox.create();
        accountHref = 'accounts/' + uuid();

        sandbox.stub(dataStore.requestExecutor,'execute',function(requestOptions,cb) {
          requestedOptions = requestOptions;

          // hack - override the salt
          requestOptions.query.encryptionKeySalt = 'uHMSUA6F8LFoCIPqKYSRCg==';
          cb(null,{
            "href": "https://api.stormpath.com/v1/accounts/1234/apiKeys",
            "items": [
              {
                "href": "https://api.stormpath.com/v1/apiKeys/5678",
                "id": "5678",
                "secret": "NuUYYcIAjRYS+LiNBPhpu/p8iYP+jBltei1n1wxcMye3FTKRCTILpP/cD6Ynfvu6S4UokPM/SwuBaEn77aM3Ww==",
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

    describe('get linked accounts', function() {
      var sandbox;
      var account;
      var opts;
      var getResourceStub;
      var cbSpy;

      before(function() {
        sandbox = sinon.sandbox.create();
        account = new Account({linkedAccounts: {href: 'boom!'}}, dataStore);
        getResourceStub = sandbox.stub(dataStore, 'getResource',
          function(href, options, ctor, cb) {
            cb();
          });

        opts = {q: 'boom!'};

        cbSpy = sandbox.spy();

        account.getLinkedAccounts(cbSpy);
        account.getLinkedAccounts(opts, cbSpy);
      });

      after(function() {
        sandbox.restore();
      });

      it('should try to get the resources', function() {
        /* jshint -W030 */
        getResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        getResourceStub.should.have.been.calledWith('boom!', null, Account, cbSpy);
        getResourceStub.should.have.been.calledWith('boom!', opts, Account, cbSpy);
      });
    });

    describe('get account links', function() {
      var sandbox;
      var account;
      var opts;
      var getResourceStub;
      var cbSpy;

      before(function() {
        sandbox = sinon.sandbox.create();
        account = new Account({accountLinks: {href: 'boom!'}}, dataStore);
        getResourceStub = sandbox.stub(dataStore, 'getResource',
          function(href, options, ctor, cb) {
            cb();
          });

        opts = {q: 'boom!'};

        cbSpy = sandbox.spy();

        account.getAccountLinks(cbSpy);
        account.getAccountLinks(opts, cbSpy);
      });

      after(function() {
        sandbox.restore();
      });

      it('should try to get the resources', function() {
        /* jshint -W030 */
        getResourceStub.should.have.been.calledTwice;
        cbSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        getResourceStub.should.have.been.calledWith('boom!', null, AccountLink, cbSpy);
        getResourceStub.should.have.been.calledWith('boom!', opts, AccountLink, cbSpy);
      });
    });

    describe('create account links', function() {
      var sandbox;
      var account;
      var otherAccount;
      var createResourceStub;
      var cbSpy;

      before(function() {
        sandbox = sinon.sandbox.create();
        account = new Account({href: 'boom!'}, dataStore);
        otherAccount = new Account({href: 'baam!'});

        createResourceStub = sandbox.stub(dataStore, 'createResource',
          function(href, options, data, ctor, cb) {
            cb();
          });

        cbSpy = sandbox.spy();

        account.createAccountLink(otherAccount, cbSpy);
      });

      after(function() {
        sandbox.restore();
      });

      it('should try to create the resource', function() {
        /* jshint -W030 */
        createResourceStub.should.have.been.calledOnce;
        cbSpy.should.have.been.calledOnce;
        /* jshint +W030 */

        assert.equal(createResourceStub.args[0][0], '/accountLinks');
        assert.equal(createResourceStub.args[0][1], null);
        assert.deepEqual(createResourceStub.args[0][2], {
          leftAccount: {
            href: 'boom!'
          },
          rightAccount: {
            href: 'baam!'
          }
        });
        assert.equal(createResourceStub.args[0][3], AccountLink);
        assert.equal(createResourceStub.args[0][4], cbSpy);
      });
    });

    describe('simple resource get/create tests', function() {
      var sandbox;
      var ds;
      var getResourceStub;
      var createResourceStub;
      var account;
      var accountData;

      before(function() {
        sandbox = sinon.sandbox.create();
        ds = new DataStore({
          client: {
            apiKey: {
              id: 1,
              secret: 2
            }
          }
        });
        getResourceStub = sinon.stub(ds, 'getResource');
        createResourceStub = sinon.stub(ds, 'createResource');

        accountData = {
          factors: {
            href: 'factorshref'
          },
          phones: {
            href: 'phoneshref'
          }
        };

        account = new Account(accountData, ds);
      });

      after(function() {
        sandbox.restore();
      });

      describe('createFactor', function() {
        var factorData;
        var options;
        var callback;

        before(function() {
          factorData = {
            type: 'sms'
          };

          options = {challenge: true};
          callback = sinon.spy();

          account.createFactor(factorData, options, callback);
        });

        it('should have called DataStore#createResource', function() {
          /*jshint -W030 */
          createResourceStub.should.have.been.calledOnce;
          /*jshint +W030 */
        });

        it('should pass the correct href to DataStore#createResource', function() {
          createResourceStub.args[0][0].should.equal(accountData.factors.href);
        });

        it('should pass the correct query data to DataStore#createResource', function() {
          createResourceStub.args[0][1].should.equal(options);
        });

        it('should pass the correct data to DataStore#createResource', function() {
          createResourceStub.args[0][2].should.equal(factorData);
        });

        it('should pass the correct constructor to DataStore#createResource', function() {
          createResourceStub.args[0][3].should.equal(SmsFactor);
        });

        it('should pass the correct callback to DataStore#createResource', function() {
          createResourceStub.args[0][4].should.equal(callback);
        });
      });

      describe('getFactors', function() {
        var options;
        var callback;

        before(function() {
          options = {query: 'boom!'};
          callback = sinon.spy();

          account.getFactors(options, callback);
        });

        it('should have called DataStore#getResource', function() {
          /*jshint -W030 */
          getResourceStub.should.have.been.calledOnce;
          /*jshint +W030 */
        });

        it('should pass the correct href to DataStore#getResource', function() {
          getResourceStub.args[0][0].should.equal(accountData.factors.href);
        });

        it('should pass the correct options to DataStore#getResource', function() {
          getResourceStub.args[0][1].should.equal(options);
        });

        it('should pass the correct constructor to DataStore#getResource', function() {
          getResourceStub.args[0][2].should.equal(FactorInstantiator);
        });

        it('should pass the correct callback to DataStore#getResource', function() {
          getResourceStub.args[0][3].should.equal(callback);
        });
      });

      describe('getPhones', function() {
        var options;
        var callback;

        before(function() {
          options = {query: 'boom!'};
          callback = sinon.spy();

          account.getPhones(options, callback);
        });

        it('should have called DataStore#getResource', function() {
          /*jshint -W030 */
          getResourceStub.should.have.been.calledTwice;
          /*jshint +W030 */
        });

        it('should pass the correct href to DataStore#getResource', function() {
          getResourceStub.args[1][0].should.equal(accountData.phones.href);
        });

        it('should pass the correct options to DataStore#getResource', function() {
          getResourceStub.args[1][1].should.equal(options);
        });

        it('should pass the correct constructor to DataStore#getResource', function() {
          getResourceStub.args[1][2].should.equal(Phone);
        });

        it('should pass the correct callback to DataStore#getResource', function() {
          getResourceStub.args[1][3].should.equal(callback);
        });
      });
    });
  });

});
