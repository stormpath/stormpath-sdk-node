'use strict';

var sinon = require('sinon');
var assert = require('chai').assert;

var Organization = require('../lib/resource/Organization');
var AccountLinkingPolicy = require('../lib/resource/AccountLinkingPolicy');

var sandbox = sinon.sandbox.create();

/*jshint -W030 */
describe('resource/Organization.js', function () {
  afterEach(function () {
    sandbox.restore();
  });

  describe('Organization', function () {
    var dataStore;
    var createResourceStub;
    var getResourceStub;
    var createResourceReturn;
    var getResourceReturn;
    var appplication;
    var organization;
    var options;
    var callbackSpy;
    var callbackReturn;

    beforeEach(function () {
      dataStore = {
        createResource: function () {},
        getResource: function () {}
      };

      createResourceReturn = 'e70e3da7-122b-49b2-90ae-b54682caac58';
      getResourceReturn = '7a5bf9e1-7253-4117-a408-d54cd1b54f4e';

      createResourceStub = sandbox.stub(dataStore, 'createResource', function (href, options, account, ctor, callback) {
        callback();

        return createResourceReturn;
      });

      getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, callback) {
        callback();

        return getResourceReturn;
      });

      appplication = {
        accounts: {
          href: '06867ac5-d989-4c28-a10f-8f21d9b90a2d'
        },
        customData: {
          href: '2e15fe93-22bf-42be-af74-b31ff8e53bcc'
        },
        defaultAccountStoreMapping: {
          href: '3197fe18-9927-4891-a4c2-69a3c19c47c8'
        },
        defaultGroupStoreMapping: {
          href: '6090d472-28c2-4138-814b-b1fef0fc2803'
        },
        groups: {
          href: '1f8c3fc4-69eb-48b1-a078-1a249a76196b'
        },
        idSiteModel: {
          href: '0967db49-93aa-48d2-b801-18ebd9dba53e'
        },
        accountStoreMappings: {
          href: 'c1913f98-e4f7-424c-a259-f48c8359e327'
        },
        accountLinkingPolicy: {
          href: '78675b49-93aa-48d2-aa03-18ebd9dba54f'
        }
      };

      organization = new Organization(appplication, dataStore);
      organization.href = '8769dfdc-0361-42d7-bb6a-a625b5054a0f';

      options = 'dc224100-7b99-477b-a165-49cc534f63fe';

      callbackSpy = sandbox.spy(function () {
        return callbackReturn;
      });

      callbackReturn = '4c9cef79-1ff1-4a93-98d2-e51359b31331';
    });

    it('should inherit from InstanceResource', function () {
      Organization.super_.name.should.equal('InstanceResource');
    });

    describe('constructor', function () {
      var superSpy;
      var argument1;
      var argument2;

      beforeEach(function () {
        superSpy = sandbox.spy(Organization, 'super_');

        argument1 = '791947c9-144d-4b83-a0d5-fc5bd205a7cd';
        argument2 = '0c9be335-923e-4070-a5d6-126e3c7b75eb';

        new Organization(argument1, argument2);
      });

      it('should call super_ with the same arguments', function () {
        superSpy.should.have.been.calledOnce;
        superSpy.should.have.been.calledWithExactly(argument1, argument2);
      });
    });

    describe('.createAccount(account, options, callback)', function () {
      var account;
      var returnValue;

      beforeEach(function () {
        account = {
          href: '9c251e6c-157a-4027-90e2-d996944854ef'
        };

        returnValue = organization.createAccount(account, options, callbackSpy);
      });

      it('should pass the options to dataStore.createResource', function () {
        createResourceStub.should.have.been.calledOnce;
        createResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.createResource', function () {
        createResourceStub.args[0][4].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.createResource', function () {
        returnValue.should.equal(createResourceReturn);
      });
    });

    describe('.createAccount(account, callback)', function () {
      var account;
      var returnValue;

      beforeEach(function () {
        account = {
          href: '4268682c-2c84-4d03-9d36-2d7f438ad84a'
        };

        returnValue = organization.createAccount(account, callbackSpy);
      });

      it('should pass the callback to dataStore.createResource', function () {
        createResourceStub.args[0][4].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.createResource', function () {
        returnValue.should.equal(createResourceReturn);
      });
    });

    describe('.getAccounts(options, callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getAccounts(options, callbackSpy);
      });

      it('should pass the options to dataStore.getResource', function () {
        getResourceStub.should.have.been.calledOnce;
        getResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getAccounts(callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getAccounts(callbackSpy);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getCustomData(options, callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getCustomData(options, callbackSpy);
      });

      it('should pass the options to dataStore.getResource', function () {
        getResourceStub.should.have.been.calledOnce;
        getResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getCustomData(callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getCustomData(callbackSpy);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getDefaultAccountStoreMapping(options, callback)', function () {
      it('should pass the options to dataStore.getResource', function () {
        organization.getDefaultAccountStoreMapping(options, callbackSpy);

        getResourceStub.should.have.been.calledOnce;
        getResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.getResource', function () {
        organization.getDefaultAccountStoreMapping(options, callbackSpy);

        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        var returnValue = organization.getDefaultAccountStoreMapping(options, callbackSpy);

        returnValue.should.equal(getResourceReturn);
      });

      describe('when defaultAccountStoreMapping is undefined', function () {
        var returnValue;

        beforeEach(function () {
          organization.defaultAccountStoreMapping = undefined;
          returnValue = organization.getDefaultAccountStoreMapping(options, callbackSpy);
        });

        it('should invoke the callback', function () {
          callbackSpy.should.have.been.calledOnce;
        });

        it('should not invoke dataStore.getResource', function () {
          getResourceStub.called.should.be.false;
        });

        it('should return the value from the callback', function () {
          returnValue.should.equal(callbackReturn);
        });
      });
    });

    describe('.getDefaultAccountStoreMapping(callback)', function () {
      it('should pass the callback to dataStore.getResource', function () {
        organization.getDefaultAccountStoreMapping(callbackSpy);

        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        var returnValue = organization.getDefaultAccountStoreMapping(callbackSpy);

        returnValue.should.equal(getResourceReturn);
      });

      describe('when defaultAccountStoreMapping is undefined', function () {
        var returnValue;

        beforeEach(function () {
          sandbox.restore();

          organization.defaultAccountStoreMapping = undefined;
          returnValue = organization.getDefaultAccountStoreMapping(callbackSpy);
        });

        it('should invoke the callback', function () {
          callbackSpy.should.have.been.calledOnce;
        });

        it('should not invoke dataStore.getResource', function () {
          getResourceStub.called.should.be.false;
        });

        it('should return the value from the callback', function () {
          returnValue.should.equal(callbackReturn);
        });
      });
    });

    describe('.getDefaultGroupStoreMapping(options, callback)', function () {
      it('should pass the options to dataStore.getResource', function () {
        organization.getDefaultGroupStoreMapping(options, callbackSpy);

        getResourceStub.should.have.been.calledOnce;
        getResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.getResource', function () {
        organization.getDefaultGroupStoreMapping(options, callbackSpy);

        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        var returnValue = organization.getDefaultGroupStoreMapping(options, callbackSpy);

        returnValue.should.equal(getResourceReturn);
      });

      describe('when getDefaultGroupStore is undefined', function () {
        var returnValue;

        beforeEach(function () {
          organization.defaultGroupStoreMapping = undefined;
          returnValue = organization.getDefaultGroupStoreMapping(options, callbackSpy);
        });

        it('should invoke the callback', function () {
          callbackSpy.should.have.been.calledOnce;
        });

        it('should not invoke dataStore.getResource', function () {
          getResourceStub.called.should.be.false;
        });

        it('should return the value from the callback', function () {
          returnValue.should.equal(callbackReturn);
        });
      });
    });

    describe('.getDefaultGroupStoreMapping(callback)', function () {
      it('should pass the callback to dataStore.getResource', function () {
        organization.getDefaultGroupStoreMapping(callbackSpy);

        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        var returnValue = organization.getDefaultGroupStoreMapping(callbackSpy);

        returnValue.should.equal(getResourceReturn);
      });

      describe('when getDefaultGroupStore is undefined', function () {
        var returnValue;

        beforeEach(function () {
          organization.defaultGroupStoreMapping = undefined;
          returnValue = organization.getDefaultGroupStoreMapping(callbackSpy);
        });

        it('should invoke the callback', function () {
          callbackSpy.should.have.been.calledOnce;
        });

        it('should not invoke dataStore.getResource', function () {
          getResourceStub.called.should.be.false;
        });

        it('should return the value from the callback', function () {
          returnValue.should.equal(callbackReturn);
        });
      });
    });

    describe('.getDefaultAccountStore(options, callback)', function () {
      var returnValue;
      var getDefaultAccountStoreMappingReturn;
      var fakeAccountStoreMapping;
      var fakeError;

      beforeEach(function () {
        getDefaultAccountStoreMappingReturn = 'ce6869a2-fa0c-44fc-a2d4-684f20274184';

        fakeAccountStoreMapping = {
          getAccountStore: sandbox.spy()
        };

        fakeError = null;

        sandbox.stub(organization, 'getDefaultAccountStoreMapping', function (options, callback) {
          callback(fakeError, fakeAccountStoreMapping);

          return getDefaultAccountStoreMappingReturn;
        });

        returnValue = organization.getDefaultAccountStore(options, callbackSpy);
      });

      it('should pass the options to organizationAccountStoreMapping.getAccountStore()', function () {
        var accountStoreSpy = fakeAccountStoreMapping.getAccountStore;

        accountStoreSpy.should.have.been.calledOnce;
        accountStoreSpy.args[0][0].should.equal(options);
      });

      it('should pass the callback to organizationAccountStoreMapping.getAccountStore()', function () {
        var accountStoreSpy = fakeAccountStoreMapping.getAccountStore;

        accountStoreSpy.should.have.been.calledOnce;
        accountStoreSpy.args[0][1].should.equal(callbackSpy);
      });

      it('should return the value from getDefaultAccountStoreMapping()', function () {
        returnValue.should.equal(getDefaultAccountStoreMappingReturn);
      });

      describe('when getDefaultAccountStoreMapping() returns an error', function () {
        beforeEach(function () {
          fakeError = '0bb3f89b-9f47-4b0a-9820-803e876932cd';

          organization.getDefaultAccountStore(options, callbackSpy);
        });

        it('should invoke the callback with the error', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(fakeError);
        });
      });

      describe('when getDefaultAccountStoreMapping() returns null', function () {
        beforeEach(function () {
          fakeAccountStoreMapping = null;

          organization.getDefaultAccountStore(options, callbackSpy);
        });

        it('should invoke the callback with null, null', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(null, null);
        });
      });
    });

    describe('.getDefaultAccountStore(callback)', function () {
      var returnValue;
      var getDefaultAccountStoreMappingReturn;
      var fakeAccountStoreMapping;
      var fakeError;

      beforeEach(function () {
        getDefaultAccountStoreMappingReturn = '368f2329-e199-4020-b0e2-5fa00ffa2ad8';

        fakeAccountStoreMapping = {
          getAccountStore: sandbox.spy()
        };

        fakeError = null;

        sandbox.stub(organization, 'getDefaultAccountStoreMapping', function (options, callback) {
          callback(fakeError, fakeAccountStoreMapping);

          return getDefaultAccountStoreMappingReturn;
        });

        returnValue = organization.getDefaultAccountStore(options, callbackSpy);
      });

      it('should pass the callback to organizationAccountStoreMapping.getAccountStore()', function () {
        var accountStoreSpy = fakeAccountStoreMapping.getAccountStore;

        accountStoreSpy.should.have.been.calledOnce;
        accountStoreSpy.args[0][1].should.equal(callbackSpy);
      });

      it('should return the value from getDefaultAccountStoreMapping()', function () {
        returnValue.should.equal(getDefaultAccountStoreMappingReturn);
      });

      describe('when getDefaultAccountStoreMapping() returns an error', function () {
        beforeEach(function () {
          fakeError = 'f7ae7b90-5604-448f-b6da-9432a2c37117';

          organization.getDefaultAccountStore(options, callbackSpy);
        });

        it('should invoke the callback with the error', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(fakeError);
        });
      });

      describe('when getDefaultAccountStoreMapping() returns null', function () {
        beforeEach(function () {
          fakeAccountStoreMapping = null;

          organization.getDefaultAccountStore(callbackSpy);
        });

        it('should invoke the callback with null, null', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(null, null);
        });
      });
    });

    describe('.getDefaultGroupStore(options, callback)', function () {
      var returnValue;
      var getDefaultGroupStoreMappingReturn;
      var fakeAccountStoreMapping;
      var fakeError;

      beforeEach(function () {
        getDefaultGroupStoreMappingReturn = '605430a2-7680-45aa-af6c-217cab68438f';

        fakeAccountStoreMapping = {
          getAccountStore: sandbox.spy()
        };

        fakeError = null;

        sandbox.stub(organization, 'getDefaultGroupStoreMapping', function (options, callback) {
          callback(fakeError, fakeAccountStoreMapping);

          return getDefaultGroupStoreMappingReturn;
        });

        returnValue = organization.getDefaultGroupStore(options, callbackSpy);
      });

      it('should pass the options to organizationAccountStoreMapping.getAccountStore()', function () {
        var accountStoreSpy = fakeAccountStoreMapping.getAccountStore;

        accountStoreSpy.should.have.been.calledOnce;
        accountStoreSpy.args[0][0].should.equal(options);
      });

      it('should pass the callback to organizationAccountStoreMapping.getAccountStore()', function () {
        var accountStoreSpy = fakeAccountStoreMapping.getAccountStore;

        accountStoreSpy.should.have.been.calledOnce;
        accountStoreSpy.args[0][1].should.equal(callbackSpy);
      });

      it('should return the value from getDefaultAccountStoreMapping()', function () {
        returnValue.should.equal(getDefaultGroupStoreMappingReturn);
      });

      describe('when getDefaultGroupStoreMapping() returns an error', function () {
        beforeEach(function () {
          fakeError = 'd981c015-006f-4f9a-ad62-4d23ae60f36d';

          organization.getDefaultGroupStore(options, callbackSpy);
        });

        it('should invoke the callback with the error', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(fakeError);
        });
      });

      describe('when getDefaultGroupStoreMapping() returns null', function () {
        beforeEach(function () {
          fakeAccountStoreMapping = null;

          organization.getDefaultGroupStore(options, callbackSpy);
        });

        it('should invoke the callback with null, null', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(null, null);
        });
      });
    });

    describe('.getDefaultGroupStore(callback)', function () {
      var returnValue;
      var getDefaultGroupStoreMappingReturn;
      var fakeAccountStoreMapping;
      var fakeError;

      beforeEach(function () {
        getDefaultGroupStoreMappingReturn = '88bdc0fe-8e85-4cd8-b3fe-a933c32a725f';

        fakeAccountStoreMapping = {
          getAccountStore: sandbox.spy()
        };

        fakeError = null;

        sandbox.stub(organization, 'getDefaultGroupStoreMapping', function (options, callback) {
          callback(fakeError, fakeAccountStoreMapping);

          return getDefaultGroupStoreMappingReturn;
        });

        returnValue = organization.getDefaultGroupStore(callbackSpy);
      });

      it('should pass the callback to organizationAccountStoreMapping.getAccountStore()', function () {
        var accountStoreSpy = fakeAccountStoreMapping.getAccountStore;

        accountStoreSpy.should.have.been.calledOnce;
        accountStoreSpy.args[0][1].should.equal(callbackSpy);
      });

      it('should return the value from getDefaultAccountStoreMapping()', function () {
        returnValue.should.equal(getDefaultGroupStoreMappingReturn);
      });

      describe('when getDefaultGroupStoreMapping() returns an error', function () {
        beforeEach(function () {
          fakeError = 'f7796c82-97a7-46ff-8b89-39c08faa89e9';

          organization.getDefaultGroupStore(callbackSpy);
        });

        it('should invoke the callback with the error', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(fakeError);
        });
      });

      describe('when getDefaultGroupStoreMapping() returns null', function () {
        beforeEach(function () {
          fakeAccountStoreMapping = null;

          organization.getDefaultGroupStore(callbackSpy);
        });

        it('should invoke the callback with null, null', function () {
          callbackSpy.should.have.been.calledOnce;
          callbackSpy.should.have.been.calledWithExactly(null, null);
        });
      });
    });

    describe('.getGroups(options, callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getGroups(options, callbackSpy);
      });

      it('should pass the options to dataStore.getResource', function () {
        getResourceStub.should.have.been.calledOnce;
        getResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getGroups(callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getGroups(callbackSpy);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getIdSiteModel(options, callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getIdSiteModel(options, callbackSpy);
      });

      it('should pass the options to dataStore.getResource', function () {
        getResourceStub.should.have.been.calledOnce;
        getResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getIdSiteModel(callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getIdSiteModel(callbackSpy);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getAccountStoreMappings(options, callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getAccountStoreMappings(options, callbackSpy);
      });

      it('should pass the options to dataStore.getResource', function () {
        getResourceStub.should.have.been.calledOnce;
        getResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getAccountStoreMappings(callback)', function () {
      var returnValue;

      beforeEach(function () {
        returnValue = organization.getAccountStoreMappings(callbackSpy);
      });

      it('should pass the callback to dataStore.getResource', function () {
        getResourceStub.args[0][3].should.equal(callbackSpy);
      });

      it('should return the value from dataStore.getResource', function () {
        returnValue.should.equal(getResourceReturn);
      });
    });

    describe('.getAccountLinkingPolicy(opts, callback)', function() {
      var opts;

      beforeEach(function() {
        opts = {
          expand: 'tenant'
        };

        organization.getAccountLinkingPolicy(callbackSpy);
        organization.getAccountLinkingPolicy(opts, callbackSpy);
        console.log('Called these two jokers');
      });

      it('should pass the callback, and the options if present, to dataStore.getResource', function() {
        /* jshint -W030 */
        getResourceStub.should.have.been.calledTwice;
        callbackSpy.should.have.been.calledTwice;
        /* jshint +W030 */

        getResourceStub.should.have.been
          .calledWith(organization.accountLinkingPolicy.href, null, AccountLinkingPolicy, callbackSpy);

        getResourceStub.should.have.been
          .calledWith(organization.accountLinkingPolicy.href, opts, AccountLinkingPolicy, callbackSpy);
      });
    });

    describe('.createAccountStoreMapping(mapping, options, callback)', function () {
      var returnValue;
      var mapping;

      beforeEach(function () {
        mapping = {
          href: '09f43c5e-ef55-40fb-a2a6-2668ea616d73'
        };

        returnValue = organization.createAccountStoreMapping(mapping, options, callbackSpy);
      });

      it('should pass the options to dataStore.createResource', function () {
        createResourceStub.should.have.been.calledOnce;
        createResourceStub.args[0][1].should.equal(options);
      });

      it('should pass the callback to dataStore.createResource', function () {
        createResourceStub.args[0][4].should.equal(callbackSpy);
      });

      it('should add the organization to the new mapping object', function () {
        var newMapping = createResourceStub.args[0][2];

        newMapping.should.have.property('organization');
        newMapping.organization.href.should.equal(organization.href);
      });

      it('should return the value from dataStore.createResource', function () {
        returnValue.should.equal(createResourceReturn);
      });
    });

    describe('.createAccountStoreMapping(mapping, callback)', function () {
      var returnValue;
      var mapping;

      beforeEach(function () {
        mapping = {
          href: '09f43c5e-ef55-40fb-a2a6-2668ea616d73'
        };

        returnValue = organization.createAccountStoreMapping(mapping, callbackSpy);
      });

      it('should pass the callback to dataStore.createResource', function () {
        createResourceStub.args[0][4].should.equal(callbackSpy);
      });

      it('should add the organization to the new mapping object', function () {
        var newMapping = createResourceStub.args[0][2];

        newMapping.should.have.property('organization');
        newMapping.organization.href.should.equal(organization.href);
      });

      it('should return the value from dataStore.createResource', function () {
        returnValue.should.equal(createResourceReturn);
      });
    });

    describe('.createAccountStoreMappings(mappings, callback)', function () {
      var returnValue;
      var createAccountStoreMappingStub;
      var mappings;

      beforeEach(function (done) {
        createAccountStoreMappingStub = sandbox.stub(organization, 'createAccountStoreMapping', function (mapping, next) {
          return next();
        });

        mappings = [
          {
            href: 'f49dda54-6bb0-4691-89c6-d54afcbb39d1'
          }, {
            href: '9ef376bb-a044-466e-803e-f16b6fb07a39'
          }, {
            href: '3af0c9a2-d9b8-4d9f-ad49-3d2b5a31e5a9'
          }
        ];

        returnValue = organization.createAccountStoreMappings(mappings, function () {
          callbackSpy();
          done();
        });
      });

      it('should call createAccountStoreMapping with each mapping', function () {
        createAccountStoreMappingStub.should.have.callCount(mappings.length);

        createAccountStoreMappingStub.args.forEach(function (args, index) {
          var mapping = args[0];

          mapping.should.equal(mappings[index]);
        });
      });

      it('should invoke callback after it has created each account store mapping', function () {
        createAccountStoreMappingStub.should.have.callCount(mappings.length);
        callbackSpy.should.have.been.calledOnce;
      });

      it('should return undefined', function () {
        assert.equal(returnValue, undefined);
      });
    });
  });
});
