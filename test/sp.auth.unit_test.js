var common = require('./common');
var sinon = common.sinon;
var should = common.should;

/* jshint -W079 */
var Buffer = require('buffer').Buffer;
/* jshint +W079 */

describe('Authorization module', function () {
  'use strict';
  var getAuthenticator = require('../lib/authc').getAuthenticator;
  var apiKey = {id: 'stormpath_apiKey_id', secret: 'stormpath_apiKey_secret'};

  describe('constructor', function(){
    function createAuth(options){
      return  function(){
        return getAuthenticator(options);
      };
    }
    describe('if apiKey not provided', function(){
      it('should throw api key is required exception', function(){
        createAuth({}).should.throw(/you must specify an ApiKey/i);
      });
    });

    describe('if apiKey.id not provided', function(){
      it('should throw apiKey.id is required', function(){
        createAuth({apiKey:{}}).should.throw(/apiKey.id is required/);
      });
    });
    describe('if apiKey.secret not provided', function(){
      it('should throw apiKey.secret is required', function(){
        createAuth({apiKey:{id:1}}).should.throw(/apiKey.secret is required/);
      });
    });
    describe('if provided auth method not supported', function(){
      function callToAuthSignWithUnsupportedAuthMethod(){
        var auth = getAuthenticator({apiKey:{id:1, secret:2}, authenticationScheme:'boom!'});
        return auth.authenticate({});
      }
      it('should throw unsupported auth method', function(){
        callToAuthSignWithUnsupportedAuthMethod
          .should.throw(/Unrecognized authentication scheme: boom!/i);
      });
    });
  });

  describe('Basic auth', function () {
    var auth = getAuthenticator({apiKey: apiKey, authenticationScheme: 'basic'});
    it('should sign request with base64 signature', function () {
      var req = {headers: {}};
      var basicAuthToken = new Buffer(apiKey.id + ':' + apiKey.secret)
        .toString('base64');
      auth.authenticate(req);
      should.exist(req.headers.Authorization);
      req.headers.Authorization.should.match(/basic/ig);
      req.headers.Authorization.should.contain(basicAuthToken);
    });
  });
  describe('Digest auth', function () {
    var uuid = require('node-uuid');
    var auth = getAuthenticator({apiKey: apiKey, authenticationScheme:'SAUTHC1'});
    var sandbox, guidStub;
    before(function () {
      sandbox = sinon.sandbox.create();
      guidStub = sandbox.stub(uuid, 'v4', function () {
        return '3412d026-624e-4778-b02d-f9906f40fc4f';
      });
      sandbox.useFakeTimers(1392387217351, 'Date'); //utc date(2014,01,14,14,13,37,351)
    });
    after(function () {
      sandbox.restore();
    });
    it('should sing request with digest signature', function () {
      var req = {
        'method': 'GET',
        'url': 'https://api.stormpath.com/v1/tenants/current',
        'headers': {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, compress',
          'Content-Type': 'application/json',
          'User-Agent': 'Stormpath-SDK-nodejs/0.0.1'
        }
      };
      // taking python implementation of digest sign as source of truth
      req.headers['User-Agent'] = 'Stormpath-PythonSDK/1.0.0.beta';

      auth.authenticate(req);

      var expectedAuthHeader ='SAuthc1 sauthc1Id=stormpath_apiKey_id/20140214/3412d026-624e-4778-b02d-f9906f40fc4f/sauthc1_request, sauthc1SignedHeaders=accept;accept-encoding;content-type;host;user-agent;x-stormpath-date, sauthc1Signature=203e26a39bec66b145bce797c0672104e0c8d5a20847686841fa1e17b56875fb';
      req.headers.Authorization.should.be.equal(expectedAuthHeader);
    });
  });
});
