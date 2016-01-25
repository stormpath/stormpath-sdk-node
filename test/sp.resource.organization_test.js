'use strict';

var common = require('./common');
var sinon = common.sinon;
var assert = common.assert;

var Organization = require('../lib/resource/Organization');

var sandbox = sinon.sandbox.create();

/*jshint -W030 */
describe('resource/Organization.js', function () {
  afterEach(function () {
    sandbox.restore();
  });

  describe('Organization', function () {
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

    describe('prototype', function () {
      var createResourceSpy;
      var getResourceSpy;
      var accounts;
      var customData;
      var defaultAccountStoreMapping;
      var defaultGroupStoreMapping;
      var groups;
      var idSiteModel;
      var accountStoreMappings;
      var appplication;
      var organization;

      beforeEach(function () {
        var dataStore = {
          createResource: sandbox.spy(),
          getResource: sandbox.spy()
        };

        createResourceSpy = dataStore.createResource;
        getResourceSpy = dataStore.getResource;

        accounts = {
          href: '06867ac5-d989-4c28-a10f-8f21d9b90a2d'
        };

        customData = {
          href: '2e15fe93-22bf-42be-af74-b31ff8e53bcc'
        };

        defaultAccountStoreMapping = {
          href: '3197fe18-9927-4891-a4c2-69a3c19c47c8'
        };

        defaultGroupStoreMapping = {
          href: '6090d472-28c2-4138-814b-b1fef0fc2803'
        };

        groups = {
          href: '1f8c3fc4-69eb-48b1-a078-1a249a76196b'
        };

        idSiteModel = {
          href: '0967db49-93aa-48d2-b801-18ebd9dba53e'
        };

        accountStoreMappings = {
          href: 'c1913f98-e4f7-424c-a259-f48c8359e327'
        };

        appplication = {
          accounts: accounts,
          customData: customData,
          defaultAccountStoreMapping: defaultAccountStoreMapping,
          defaultGroupStoreMapping: defaultGroupStoreMapping,
          groups: groups,
          idSiteModel: idSiteModel,
          accountStoreMappings: accountStoreMappings
        };

        organization = new Organization(appplication, dataStore);
        organization.href = '8769dfdc-0361-42d7-bb6a-a625b5054a0f';
      });

      describe('createAccount method', function () {
        var account;
        var options;
        var callbackSpy;

        beforeEach(function () {
          account = {
            href: '9c251e6c-157a-4027-90e2-d996944854ef'
          };

          options = 'dc224100-7b99-477b-a165-49cc534f63fe';
          callbackSpy = sandbox.spy();
        });

        describe('when called as createAccount(account, options, callback)', function () {
          beforeEach(function () {
            organization.createAccount(account, options, callbackSpy);
          });

          it('should call dataStore.createResource with accounts.href, options, account, Account, callback', function () {
            createResourceSpy.should.have.been.calledOnce;
            createResourceSpy.args[0][0].should.equal(accounts.href);
            createResourceSpy.args[0][1].should.equal(options);
            createResourceSpy.args[0][2].should.equal(account);

            createResourceSpy.args[0][3].should.be.a('function');
            createResourceSpy.args[0][3].name.should.equal('Account');

            createResourceSpy.args[0][4].should.equal(callbackSpy);
          });
        });

        describe('when called as createAccount(account, callback)', function () {
          beforeEach(function () {
            organization.createAccount(account, callbackSpy);
          });

          it('should call dataStore.createResource with accounts.href, null, account, Account, callback', function () {
            createResourceSpy.should.have.been.calledOnce;
            createResourceSpy.args[0][0].should.equal(accounts.href);
            assert.equal(createResourceSpy.args[0][1], null);
            createResourceSpy.args[0][2].should.equal(account);

            createResourceSpy.args[0][3].should.be.a('function');
            createResourceSpy.args[0][3].name.should.equal('Account');

            createResourceSpy.args[0][4].should.equal(callbackSpy);
          });
        });
      });

      describe('getAccounts method', function () {
        var options;
        var callbackSpy;

        beforeEach(function () {
          options = 'f3700587-414c-43b1-88df-f46d917ccfec';
          callbackSpy = sandbox.spy();
        });

        describe('when called as getAccounts(options, callback)', function () {
          beforeEach(function () {
            organization.getAccounts(options, callbackSpy);
          });

          it('should call dataStore.getResource with accounts.href, options, Account, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(accounts.href);
            getResourceSpy.args[0][1].should.equal(options);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('Account');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });

        describe('when called as getAccounts(callback)', function () {
          beforeEach(function () {
            organization.getAccounts(callbackSpy);
          });

          it('should call dataStore.getResource with accounts.href, null, Account, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(accounts.href);
            assert.equal(getResourceSpy.args[0][1], null);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('Account');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });
      });

      describe('getCustomData method', function () {
        var options;
        var callbackSpy;

        beforeEach(function () {
          options = '2748c1c4-a274-4f83-9289-d3d9e3d314a0';
          callbackSpy = sandbox.spy();
        });

        describe('when called as getCustomData(options, callback)', function () {
          beforeEach(function () {
            organization.getCustomData(options, callbackSpy);
          });

          it('should call dataStore.getResource with customData.href, options, CustomData, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(customData.href);
            getResourceSpy.args[0][1].should.equal(options);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('CustomData');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });

        describe('when called as getCustomData(callback)', function () {
          beforeEach(function () {
            organization.getCustomData(callbackSpy);
          });

          it('should call dataStore.getResource with customData.href, null, CustomData, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(customData.href);
            assert.equal(getResourceSpy.args[0][1], null);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('CustomData');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });
      });

      describe('getDefaultAccountStore method', function () {
        var options;
        var callbackSpy;

        beforeEach(function () {
          options = 'd0778968-2771-4065-bbf1-718b40e83099';
          callbackSpy = sandbox.spy();
        });

        describe('when called as getDefaultAccountStore(options, callback)', function () {
          it('should call dataStore.getResource with defaultAccountStoreMapping.href, options, OrganizationAccountStoreMapping, callback', function () {
            organization.getDefaultAccountStore(options, callbackSpy);

            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(defaultAccountStoreMapping.href);
            getResourceSpy.args[0][1].should.equal(options);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('OrganizationAccountStoreMapping');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });

          describe('when defaultAccountStoreMapping is undefined', function () {
            beforeEach(function () {
              organization.defaultAccountStoreMapping = undefined;
              organization.getDefaultAccountStore(options, callbackSpy);
            });

            it('should invoke the callback', function () {
              callbackSpy.should.have.been.calledOnce;
            });

            it('should not invoke dataStore.getResource', function () {
              getResourceSpy.called.should.be.false;
            });
          });
        });

        describe('when called as getDefaultAccountStore(callback)', function () {
          it('should call dataStore.getResource with defaultAccountStoreMapping.href, null, OrganizationAccountStoreMapping, callback', function () {
            organization.getDefaultAccountStore(callbackSpy);

            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(defaultAccountStoreMapping.href);
            assert.equal(getResourceSpy.args[0][1], null);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('OrganizationAccountStoreMapping');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });

          describe('when defaultAccountStoreMapping is undefined', function () {
            beforeEach(function () {
              organization.defaultAccountStoreMapping = undefined;
              organization.getDefaultAccountStore(callbackSpy);
            });

            it('should invoke the callback', function () {
              callbackSpy.should.have.been.calledOnce;
            });

            it('should not invoke dataStore.getResource', function () {
              getResourceSpy.called.should.be.false;
            });
          });
        });
      });

      describe('getDefaultGroupStore method', function () {
        var options;
        var callbackSpy;

        beforeEach(function () {
          options = 'd36daa12-6c44-4407-931f-47a21c57142c';
          callbackSpy = sandbox.spy();
        });

        describe('when called as getDefaultGroupStore(options, callback)', function () {
          it('should call dataStore.getResource with defaultGroupStoreMapping.href, options, OrganizationAccountStoreMapping, callback', function () {
            organization.getDefaultGroupStore(options, callbackSpy);

            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(defaultGroupStoreMapping.href);
            getResourceSpy.args[0][1].should.equal(options);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('OrganizationAccountStoreMapping');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });

          describe('when getDefaultGroupStore is undefined', function () {
            beforeEach(function () {
              organization.defaultGroupStoreMapping = undefined;
              organization.getDefaultGroupStore(options, callbackSpy);
            });

            it('should invoke the callback', function () {
              callbackSpy.should.have.been.calledOnce;
            });

            it('should not invoke dataStore.getResource', function () {
              getResourceSpy.called.should.be.false;
            });
          });
        });

        describe('when called as getDefaultGroupStore(callback)', function () {
          it('should call dataStore.getResource with defaultGroupStoreMapping.href, null, OrganizationAccountStoreMapping, callback', function () {
            organization.getDefaultGroupStore(callbackSpy);

            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(defaultGroupStoreMapping.href);
            assert.equal(getResourceSpy.args[0][1], null);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('OrganizationAccountStoreMapping');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });

          describe('when defaultGroupStoreMapping is undefined', function () {
            beforeEach(function () {
              organization.defaultGroupStoreMapping = undefined;
              organization.getDefaultGroupStore(callbackSpy);
            });

            it('should invoke the callback', function () {
              callbackSpy.should.have.been.calledOnce;
            });

            it('should not invoke dataStore.getResource', function () {
              getResourceSpy.called.should.be.false;
            });
          });
        });
      });

      describe('getGroups method', function () {
        var options;
        var callbackSpy;

        beforeEach(function () {
          options = '0fee076c-1b3e-4316-8c83-4fc224be9db7';
          callbackSpy = sandbox.spy();
        });

        describe('when called as getGroups(options, callback)', function () {
          beforeEach(function () {
            organization.getGroups(options, callbackSpy);
          });

          it('should call dataStore.getResource with groups.href, options, Group, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(groups.href);
            getResourceSpy.args[0][1].should.equal(options);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('Group');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });

        describe('when called as getGroups(callback)', function () {
          beforeEach(function () {
            organization.getGroups(callbackSpy);
          });

          it('should call dataStore.getResource with groups.href, null, Group, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(groups.href);
            assert.equal(getResourceSpy.args[0][1], null);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('Group');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });
      });

      describe('getIdSiteModel method', function () {
        var options;
        var callbackSpy;

        beforeEach(function () {
          options = '99b70a59-2e5d-4ff7-b635-dde989665e4a';
          callbackSpy = sandbox.spy();
        });

        describe('when called as getIdSiteModel(options, callback)', function () {
          beforeEach(function () {
            organization.getIdSiteModel(options, callbackSpy);
          });

          it('should call dataStore.getResource with idSiteModel.href, options, IdSiteModel, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(idSiteModel.href);
            getResourceSpy.args[0][1].should.equal(options);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('IdSiteModel');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });

        describe('when called as getIdSiteModel(callback)', function () {
          beforeEach(function () {
            organization.getIdSiteModel(callbackSpy);
          });

          it('should call dataStore.getResource with idSiteModel.href, null, IdSiteModel, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(idSiteModel.href);
            assert.equal(getResourceSpy.args[0][1], null);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('IdSiteModel');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });
      });

      describe('getAccountStoreMappings method', function () {
        var options;
        var callbackSpy;

        beforeEach(function () {
          options = '5ee81e20-a59c-4ff8-90f6-d6c0ccc713ac';
          callbackSpy = sandbox.spy();
        });

        describe('when called as getAccountStoreMappings(options, callback)', function () {
          beforeEach(function () {
            organization.getAccountStoreMappings(options, callbackSpy);
          });

          it('should call dataStore.getResource with accountStoreMappings.href, options, OrganizationAccountStoreMapping, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(accountStoreMappings.href);
            getResourceSpy.args[0][1].should.equal(options);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('OrganizationAccountStoreMapping');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });

        describe('when called as getAccountStoreMappings(callback)', function () {
          beforeEach(function () {
            organization.getAccountStoreMappings(callbackSpy);
          });

          it('should call dataStore.getResource with accountStoreMappings.href, null, OrganizationAccountStoreMapping, callback', function () {
            getResourceSpy.should.have.been.calledOnce;
            getResourceSpy.args[0][0].should.equal(accountStoreMappings.href);
            assert.equal(getResourceSpy.args[0][1], null);

            getResourceSpy.args[0][2].should.be.a('function');
            getResourceSpy.args[0][2].name.should.equal('OrganizationAccountStoreMapping');

            getResourceSpy.args[0][3].should.equal(callbackSpy);
          });
        });
      });

      describe('createAccountStoreMapping method', function () {
        var mapping;
        var options;
        var callbackSpy;

        beforeEach(function () {
          mapping = {
            href: '09f43c5e-ef55-40fb-a2a6-2668ea616d73'
          };

          options = '86c7489e-5751-4025-8ace-164c9459428f';
          callbackSpy = sandbox.spy();
        });

        describe('when called as createAccountStoreMapping(mapping, options, callback)', function () {
          beforeEach(function () {
            organization.createAccountStoreMapping(mapping, options, callbackSpy);
          });

          it('should call dataStore.createResource with "/organizationAccountStoreMappings", options, mapping, OrganizationAccountStoreMapping, callback', function () {
            createResourceSpy.should.have.been.calledOnce;
            createResourceSpy.args[0][0].should.equal('/organizationAccountStoreMappings');
            createResourceSpy.args[0][1].should.equal(options);

            createResourceSpy.args[0][2].should.be.an('object');
            createResourceSpy.args[0][2].href.should.equal(mapping.href);

            createResourceSpy.args[0][3].should.be.a('function');
            createResourceSpy.args[0][3].name.should.equal('OrganizationAccountStoreMapping');

            createResourceSpy.args[0][4].should.equal(callbackSpy);
          });

          it('should add the organization to the new mapping object', function () {
            var newMapping = createResourceSpy.args[0][2];

            newMapping.should.have.property('organization');
            newMapping.organization.href.should.equal(organization.href);
          });
        });

        describe('when called as createAccountStoreMapping(mapping, callback)', function () {
          beforeEach(function () {
            organization.createAccountStoreMapping(mapping, callbackSpy);
          });

          it('should call dataStore.createResource with "/organizationAccountStoreMappings", null, mapping, OrganizationAccountStoreMapping, callback', function () {
            createResourceSpy.should.have.been.calledOnce;
            createResourceSpy.args[0][0].should.equal('/organizationAccountStoreMappings');
            assert.equal(createResourceSpy.args[0][1], null);

            createResourceSpy.args[0][2].should.be.an('object');
            createResourceSpy.args[0][2].href.should.equal(mapping.href);

            createResourceSpy.args[0][3].should.be.a('function');
            createResourceSpy.args[0][3].name.should.equal('OrganizationAccountStoreMapping');

            createResourceSpy.args[0][4].should.equal(callbackSpy);
          });

          it('should add the organization to the new mapping object', function () {
            var newMapping = createResourceSpy.args[0][2];

            newMapping.should.have.property('organization');
            newMapping.organization.href.should.equal(organization.href);
          });
        });
      });

      describe('createAccountStoreMappings method', function () {
        var createAccountStoreMappingStub;
        var mappings;
        var callbackSpy;

        beforeEach(function () {
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

          callbackSpy = sandbox.spy();
        });

        describe('when called as createAccountStoreMappings(mappings, callback)', function () {
          beforeEach(function (done) {
            organization.createAccountStoreMappings(mappings, function () {
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
        });
      });
    });
  });
});
