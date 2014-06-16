var common = require('./common');
var assert = common.assert;
var jwt = require('jwt-simple');
var utils = require('../lib/utils');

var OauthAccessTokenResult = require('../lib/resource/OauthAccessTokenResult');
var DataStore = require('../lib/ds/DataStore');

describe('OauthAccessTokenResult', function () {
  var clientApiSecret = 'secret';
  var ds = new DataStore({apiKey:{id:1,secret:clientApiSecret}});
  var fakeApiKey = {
    href: '/href',
    id: 'the key id',
    secret: 'the key secret'
  };
  var fakeAppHref = 'some app href';
  describe('if built property with deafults', function(){

    var oauthAccessTokenResult = new OauthAccessTokenResult(fakeApiKey,ds);

    oauthAccessTokenResult.setApplicationHref(fakeAppHref);

    var response;

    describe('when getTokenResponse is called', function(){

      it('should not throw', function(){
        assert.doesNotThrow(function(){
          response = oauthAccessTokenResult.getTokenResponse();
        });
      });

    });

    describe('the response value', function(){

      it('should have an access_token property', function(){
        assert.isString(response.access_token);
      });

      it('should have the default ttl', function(){
        assert.equal(response.expires_in,3600);
      });

      it('should set the token type to bearer', function(){
        assert.equal(response.token_type,'bearer');
      });

    });

    describe('the decoded access_token', function(){

      var decoded;

      before(function(){
        decoded = jwt.decode(response.access_token,clientApiSecret);
      });

      it('should have api key as the sub', function(){
        assert.equal(decoded.sub,fakeApiKey.id);
      });
      it('should have the application href as the iss', function(){
        assert.equal(decoded.iss,fakeAppHref);
      });
      it('should have a timestamp (iat) that is equal to now', function(){
        // .. give or take a second because test may run parallel
        var diff = utils.nowEpochSeconds() - decoded.iat;
        assert.closeTo(diff,0,1);
      });
      it('should have an expiry (exp) in one hour (the default)', function(){
        var diff = decoded.exp - decoded.iat;
        assert.equal(diff,3600);
      });

    });


  });
  describe('if built property with a custom ttl', function(){

    var oauthAccessTokenResult = new OauthAccessTokenResult(fakeApiKey,ds);

    oauthAccessTokenResult.setApplicationHref('some app href');

    oauthAccessTokenResult.setTtl(1);

    var response = oauthAccessTokenResult.getTokenResponse();

    describe('the response value', function(){

      it('should have the custom ttl', function(){
        assert.equal(response.expires_in,1);
      });

    });

  });

  describe('if built property with custom scope', function(){

    var s = 'all-the-things';

    var oauthAccessTokenResult = new OauthAccessTokenResult(fakeApiKey,ds);

    oauthAccessTokenResult.setApplicationHref('some app href');

    oauthAccessTokenResult.addScope(s);

    var response = oauthAccessTokenResult.getTokenResponse();

    var decoded = jwt.decode(response.access_token,clientApiSecret);

    describe('the decoded access_token', function(){

      it('should have the custom scope', function(){
        assert.equal(decoded.scope,s);
      });

    });

  });

  describe('if passed a ttl that is not a number', function(){

    var oauthAccessTokenResult = new OauthAccessTokenResult(fakeApiKey,ds);

    it('should throw', function(){
      assert.throws(function(){
        oauthAccessTokenResult.setTtl('blah');
      });
    });

  });
});