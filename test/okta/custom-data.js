'use strict';

var Account = require('../../lib/resource/Account');
var common = require('../common');
var assert = common.assert;


describe('Account', function () {
  describe('.tranformOktaUser', function () {
    it('should map profile data onto custom data', function () {
      // toOktaUser is ran when new Accounts are constructed
      var account = new Account({
        profile: {
          prop_a: '1',
          nested_property_foo: 'bar'
        },
        _links: {}
      });

      assert.deepEqual(account.customData, {
        prop: {
          a: '1'
        },
        nested: {
          property: {
            foo: 'bar'
          }
        }
      });

    });
  });
  describe('.toOktaUser()', function () {
    it('should map custom data onto okta profile data properties', function () {
      var account = new Account({
        _links: {},
        profile: {}
      });
      account.customData.things = [1, 2, 3];
      account.customData.simple = 'bar';
      account.customData.prop = {
        a: '1'
      };
      account.customData.nested = {
        property: {
          foo: 'bar'
        },
        things2: ['a', 'b', 'c']
      };
      var oktaUser = account.toOktaUser();
      assert.deepEqual(oktaUser.profile, {
        things: [1, 2, 3],
        simple: 'bar',
        prop_a: '1',
        nested_property_foo: 'bar',
        nested_things2: ['a', 'b', 'c']
      });
    });
  });
  describe('.toOktaUser({customDataStrategy: stringify})', function () {
    it('should map custom data onto okta profile data as a JSON string', function () {
      var account = new Account({
        _links: {},
        profile: {}
      });
      account.customData.simple = 'bar';
      account.customData.prop = {
        a: '1'
      };
      account.customData.nested = {
        property: {
          foo: 'bar'
        },
        things2: ['a', 'b', 'c']
      };
      var oktaUser = account.toOktaUser({ customDataStrategy: 'serialize' });
      assert.equal(oktaUser.profile.customData, JSON.stringify(account.customData));
    });
  });
});