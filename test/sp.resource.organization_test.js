"use strict";

var common = require('./common');
var sinon = common.sinon;

var Account = require('../lib/resource/Account');
var CustomData = require('../lib/resource/CustomData');
var DataStore = require('../lib/ds/DataStore');
var Group = require('../lib/resource/Group');
var IdSiteModel = require('../lib/resource/IdSiteModel');
var Organization = require('../lib/resource/Organization');
var OrganizationAccountStoreMapping = require('../lib/resource/OrganizationAccountStoreMapping');

/*jshint -W030 */
describe('Resources: ', function () {
  describe('Organization resource', function () {
    var dataStore = new DataStore({client: {apiKey: {id: 1, secret: 2}}});

    describe('create account', function () {
      describe('if accounts are set', function () {
        var createResourceStub;

        var opt = {}, acc = {};
        var sandbox = sinon.sandbox.create();
        var cbSpy = sandbox.spy();
        var app = { accounts: { href: 'boom!' } };
        var organization = new Organization(app, dataStore);

        before(function () {
          createResourceStub = sandbox.stub(dataStore, 'createResource',
            function (href, options, account, ctor, cb) {
              cb();
            });

          organization.createAccount(acc, cbSpy);
          organization.createAccount(acc, opt, cbSpy);
        });

        after(function () {
          sandbox.restore();
        });

        it('should create account', function () {
          cbSpy.should.have.been.calledTwice;
          createResourceStub.should.have.been.calledTwice;

          createResourceStub.should.have.been.calledWith(
            app.accounts.href, null, acc, Account, cbSpy
          );

          createResourceStub.should.have.been.calledWith(
            app.accounts.href, opt, acc, Account, cbSpy
          );
        });
      });
    });

    describe('get accounts', function () {
      describe('if accounts are set', function () {
        var getResourceStub;

        var sandbox = sinon.sandbox.create();
        var cbSpy = sandbox.spy();
        var app = {accounts: {href: 'boom!'}}, opt = {};
        var organization = new Organization(app, dataStore);

        before(function () {
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });

          organization.getAccounts(cbSpy);
          organization.getAccounts(opt, cbSpy);
        });

        after(function () {
          sandbox.restore();
        });

        it('should get accounts', function () {
          cbSpy.should.have.been.calledTwice;
          getResourceStub.should.have.been.calledTwice;

          getResourceStub.should.have.been.calledWith(
            app.accounts.href, null, Account, cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            app.accounts.href, opt, Account, cbSpy
          );
        });
      });
    });

    describe('get custom data', function () {
      describe('if customData are set', function () {
        var getResourceStub;

        var sandbox = sinon.sandbox.create();
        var cbSpy = sandbox.spy();
        var app = {customData: {href: 'boom!'}}, opt = {};
        var organization = new Organization(app, dataStore);

        before(function () {
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });

          organization.getCustomData(cbSpy);
          organization.getCustomData(opt, cbSpy);
        });

        after(function () {
          sandbox.restore();
        });

        it('should get accounts', function () {
          cbSpy.should.have.been.calledTwice;
          getResourceStub.should.have.been.calledTwice;

          getResourceStub.should.have.been.calledWith(
            app.customData.href, null, CustomData, cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            app.customData.href, opt, CustomData, cbSpy
          );
        });
      });
    });

    describe('get default account store', function () {
      describe('if defaultAccountStoreMapping are set', function () {
        var getResourceStub;

        var sandbox = sinon.sandbox.create();
        var cbSpy = sandbox.spy();
        var app = {defaultAccountStoreMapping: {href: 'boom!'}}, opt = {};
        var organization = new Organization(app, dataStore);

        before(function () {
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });

          organization.getDefaultAccountStore(cbSpy);
          organization.getDefaultAccountStore(opt, cbSpy);
        });

        after(function () {
          sandbox.restore();
        });

        it('should get accounts', function () {
          cbSpy.should.have.been.calledTwice;
          getResourceStub.should.have.been.calledTwice;

          getResourceStub.should.have.been.calledWith(
            app.defaultAccountStoreMapping.href, null, OrganizationAccountStoreMapping, cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            app.defaultAccountStoreMapping.href, opt, OrganizationAccountStoreMapping, cbSpy
          );
        });
      });
    });

    describe('get default group store', function () {
      describe('if defaultGroupStoreMapping are set', function () {
        var getResourceStub;

        var sandbox = sinon.sandbox.create();
        var cbSpy = sandbox.spy();
        var app = {defaultGroupStoreMapping: {href: 'boom!'}}, opt = {};
        var organization = new Organization(app, dataStore);

        before(function () {
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });

          organization.getDefaultGroupStore(cbSpy);
          organization.getDefaultGroupStore(opt, cbSpy);
        });

        after(function () {
          sandbox.restore();
        });

        it('should get accounts', function () {
          cbSpy.should.have.been.calledTwice;
          getResourceStub.should.have.been.calledTwice;

          getResourceStub.should.have.been.calledWith(
            app.defaultGroupStoreMapping.href, null, OrganizationAccountStoreMapping, cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            app.defaultGroupStoreMapping.href, opt, OrganizationAccountStoreMapping, cbSpy
          );
        });
      });
    });

    describe('get groups', function () {
      describe('if groups href are set', function () {
        var getResourceStub;

        var sandbox = sinon.sandbox.create();
        var cbSpy = sandbox.spy();
        var app = {groups: {href: 'boom!'}}, opt = {};
        var organization = new Organization(app, dataStore);

        before(function () {
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });

          organization.getGroups(cbSpy);
          organization.getGroups(opt, cbSpy);
        });

        after(function () {
          sandbox.restore();
        });

        it('should get groups', function () {
          cbSpy.should.have.been.calledTwice;
          getResourceStub.should.have.been.calledTwice;

          getResourceStub.should.have.been.calledWith(
            app.groups.href, null, Group, cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            app.groups.href, opt, Group, cbSpy
          );
        });
      });
    });

    describe('get id site model', function () {
      describe('if idSiteModel are set', function () {
        var getResourceStub;

        var sandbox = sinon.sandbox.create();
        var cbSpy = sandbox.spy();
        var app = {idSiteModel: {href: 'boom!'}}, opt = {};
        var organization = new Organization(app, dataStore);

        before(function () {
          getResourceStub = sandbox.stub(dataStore, 'getResource', function (href, options, ctor, cb) {
            cb();
          });

          organization.getIdSiteModel(cbSpy);
          organization.getIdSiteModel(opt, cbSpy);
        });

        after(function () {
          sandbox.restore();
        });

        it('should get accounts', function () {
          cbSpy.should.have.been.calledTwice;
          getResourceStub.should.have.been.calledTwice;

          getResourceStub.should.have.been.calledWith(
            app.idSiteModel.href, null, IdSiteModel, cbSpy
          );

          getResourceStub.should.have.been.calledWith(
            app.idSiteModel.href, opt, IdSiteModel, cbSpy
          );
        });
      });
    });
  });
});
