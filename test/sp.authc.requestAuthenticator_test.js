/* jshint -W030 */
'use strict';

var RequestAuthenticator = require('../lib/authc/RequestAuthenticator');

describe('authc', function () {
  describe('RequestAuthenticator class', function () {
    function createAuth(apiKey){
      return function(){
        return new RequestAuthenticator(apiKey);
      };
    }
    describe('if apiKey not provided', function () {
      it('should throw api key is required exception', function () {
        createAuth(null).should.throw(/apiKey is required/i);
      });
    });

    describe('if apiKey.id not provided', function () {
      it('should throw apiKey.id is required', function () {
        createAuth({}).should.throw(/apiKey.id is required/);
      });
    });
    describe('if apiKey.secret not provided', function () {
      it('should throw apiKey.secret is required', function () {
        createAuth({id: 1}).should.throw(/apiKey.secret is required/);
      });
    });
  });
});