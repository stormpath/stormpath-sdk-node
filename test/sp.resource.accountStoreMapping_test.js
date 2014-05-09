var common = require('./common');
var nock = common.nock;
var async = require('async');
var u = common.u;

var Group = require('../lib/resource/Group');
var Directory = require('../lib/resource/Directory');
var Application = require('../lib/resource/Application');
var AccountStoreMapping = require('../lib/resource/AccountStoreMapping');
var DataStore = require('../lib/ds/DataStore');
var BASE_URL = u.BASE_URL;

describe('Resources: ', function () {
  "use strict";
  describe('Account Store Mapping resource', function () {
    var dataStore = new DataStore({apiKey: {id: 1, secret: 2}});

    describe('get application', function () {
      var asm, appData, app, app2, accountStoreMapping;
      before(function (done) {
        // arrange
        appData = { href: '/application/test/href', name: 'boom'};
        asm = { application: {href: appData.href} };
        accountStoreMapping = new AccountStoreMapping(asm, dataStore);

        // act
        async.parallel([
          function getApp(cb) {
            nock(BASE_URL).get(u.v1(appData.href)).reply(200, appData);
            accountStoreMapping.getApplication(function (err, res) {
              app = res;
              cb();
            });
          },
          function getAppWithOptions(cb) {
            nock(BASE_URL).get(u.v1(appData.href)).reply(200, appData);
            accountStoreMapping.getApplication({}, function (err, res) {
              app2 = res;
              cb();
            });
          }
        ], done);
      });

      // assert
      it('should get application resource', function () {
        app.href.should.be.deep.equal(appData.href);
        app.name.should.be.deep.equal(appData.name);

        app2.href.should.be.deep.equal(appData.href);
        app2.name.should.be.deep.equal(appData.name);
      });
      it('should be an instance of Application resource', function () {
        app.should.be.an.instanceOf(Application);

        app2.should.be.an.instanceOf(Application);
      });
    });

    describe('get account store', function () {
      function testAccountStore(data, type) {
        return function () {
          var asm, resource, resource2, accountStoreMapping;
          before(function (done) {
            // arrange
            asm = { accountStore: {href: data.href} };
            accountStoreMapping = new AccountStoreMapping(asm, dataStore);

            // act
            async.parallel([
              function getApp(cb) {
                nock(BASE_URL).get(u.v1(data.href)).reply(200, data);
                accountStoreMapping.getAccountStore(function (err, res) {
                  resource = res;
                  cb();
                });
              },
              function getAppWithOptions(cb) {
                nock(BASE_URL).get(u.v1(data.href)).reply(200, data);
                accountStoreMapping.getAccountStore({}, function (err, res) {
                  resource2 = res;
                  cb();
                });
              }
            ], done);

          });

          // assert
          it('should get account store', function () {
            resource.href.should.be.deep.equal(data.href);
            resource.name.should.be.deep.equal(data.name);

            resource2.href.should.be.deep.equal(data.href);
            resource2.name.should.be.deep.equal(data.name);
          });
          it('should be type of ' + type.name + ' resource', function () {
            resource.should.be.an.instanceOf(type);

            resource2.should.be.an.instanceOf(type);
          });
        };
      }

      describe('if store type is directory', testAccountStore({
        href: '/directories/test/href',
        name: 'directory boom'
      }, Directory));

      describe('if store type is group', testAccountStore({
        href: '/groups/test/href',
        name: 'group boom'
      }, Group));
    });

    describe('set application', function () {
      var app, accountStoreMapping;
      before(function () {
        // arrange
        app = { href: '/application/test/href', name: 'boom'};
        accountStoreMapping = new AccountStoreMapping({}, dataStore);

        // act
        accountStoreMapping.setApplication(app);
      });
      // assert
      it('should set application href', function () {
        accountStoreMapping.application.href.should.be.equal(app.href);
      });
    });
    describe('set account store', function () {
      var store, accountStoreMapping;
      before(function () {
        // arrange
        store = { href: '/store/test/href', name: 'boom'};
        accountStoreMapping = new AccountStoreMapping({}, dataStore);

        // act
        accountStoreMapping.setAccountStore(store);
      });
      // assert
      it('should set account store href', function () {
        accountStoreMapping.accountStore.href.should.be.equal(store.href);
      });
    });
  });
});