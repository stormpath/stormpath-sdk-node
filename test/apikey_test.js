/*jshint expr: true*/
/*jshint unused: false*/
'use strict';

var authc = require('../lib/authc'),
  propsParser = require('properties-parser'),
  chai = require('chai'),
  should = chai.should();

chai.use(require('sinon-chai'));
require('mocha-sinon');

var home = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = home + '/.stormpath/apiKey.properties2';

describe('ApiKey', function () {
  it('should have id and secret properties', function () {
    var apiKey = new authc.ApiKey('foo', 'bar');
    apiKey.id.should.equal('foo');
    apiKey.secret.should.equal('bar');
  });
});

/*
describe('loadApiKey', function () {

  beforeEach(function() {
    var mockParser = {
      read: function(path, callback) {
        var error = new Error('file does not exist!');
        callback(error, null);
      }
    }

    this.sinon.stub(propsParser, 'read', function() {

    })
  });


  it('should error when file is not found', function () {
    apiKeys.retrieveApiKey('/doesNotExist', function(error, )
  })
});
*/

