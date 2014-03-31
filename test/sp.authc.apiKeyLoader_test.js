/* jshint -W030 */
'use strict';

var common = require('./common');
var expect = common.expect;

var ApiKey = require('../lib/authc/ApiKey');
var loadApiKey = require('../lib/authc/ApiKeyLoader');

var path = './test/fixtures/apiKey.properties';

describe('authc', function () {
  describe('ApiKey loader', function(){
    it('should load prefixed file path with file://', function(done){
      loadApiKey('file://' + path, function(err, apiKey){
        expect(err).to.be.null;
        apiKey.should.be.ok;
        done();
      });
    });
    it('should load preferences with relative file path', function(done){
      loadApiKey(path, function(err, apiKey){
        expect(err).to.be.null;
        apiKey.should.be.ok;
        done();
      });
    });
    it('should return error in callback if path is wrong', function(done){
      loadApiKey('boom' + path, function(err, apiKey){
        err.should.be.an.instanceof(Error);
        err.message.should.match(/unable to read/i);
        expect(apiKey).to.be.null;
        done();
      });
    });
    it('should return instance of ApiKey with loaded params', function(done){
      loadApiKey(path, function(err, apiKey){
        apiKey.should.be.an.instanceof(ApiKey);
        apiKey.id.should.be.equal('api_key_id');
        apiKey.secret.should.be.equal('api_key_secret');
        done();
      });
    });
  });
});