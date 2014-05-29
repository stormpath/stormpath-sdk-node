/* jshint -W030 */
var common = require('./common');
var sinon = common.sinon;

var Group = require('../lib/resource/Group');
var Account = require('../lib/resource/Account');
var DataStore = require('../lib/ds/DataStore');
var instantiate = require('../lib/resource/ResourceFactory').instantiate;

describe('Resources: ', function () {
  "use strict";
  describe('CustomData resource class', function () {
    function removeFieldTest(Ctor, href) {
      describe(Ctor.name + ' remove custom data field', function () {
        var dataStore;
        var sandbox, fieldName,
          dcr, dcrJSON,
          deleteHref, cbSpy, deleteResourceStub, saveResourceStub;

        before(function () {
          sandbox = sinon.sandbox.create();
          // arrange
          dataStore = new DataStore({apiKey: {id: 1, secret: 2}});
          fieldName = 'field_name_to_remove';
          dcrJSON = {
            href: 'some_href',
            customData: {href: href}
          };
          dcrJSON.customData[fieldName] = 'boom!';
          dcr = instantiate(Ctor, dcrJSON, null, dataStore);

          cbSpy = sandbox.spy();
          deleteResourceStub = sandbox.stub(dcr.customData.dataStore, 'deleteResource', function (uri, cb) {
            deleteHref = uri;
            cb();
          });

          saveResourceStub = sandbox.stub(dataStore, 'saveResource', function () {
            arguments[arguments.length -1]();
          });

          // act
          dcr.customData.remove(fieldName);
          dcr.save(cbSpy);

          dcr.customData.remove(fieldName);
          dcr.customData.save(cbSpy);
        });
        after(function () {
          sandbox.restore();
        });
        it('should make delete request with field name in href', function () {
          //assert
          deleteResourceStub.should.have.been.calledTwice;
          cbSpy.should.have.been.calledTwice;
          deleteHref.href.should.contain(href);
          deleteHref.href.should.contain(fieldName);
        });
      });
    }

    removeFieldTest(Account, '/custom/data/href');
    removeFieldTest(Group, '/custom/data/href/');
  });
});