'use strict';

var assert = require('assert');

var AuthRequestParser = require('../lib/authc/AuthRequestParser');

describe('AuthRequestParser', function() {
  it('should throw an error if request is not an object', function() {
    assert.throws(function() {
      new AuthRequestParser('test', 'woo');
    }, Error);
  });

  it('should throw an error if request.url is not a string', function() {
    assert.throws(function() {
      new AuthRequestParser({
        body: null,
        headers: {},
        method: 'get',
        url: 1,
      }, ['body']);
    }, Error);
  });

  it('should throw an error if locationsToSearch is not an array', function() {
    assert.throws(function() {
      new AuthRequestParser({
        body: null,
        headers: {},
        method: 'get',
        url: 'test'
      }, 'woo');
    }, Error);
  });

  it('should throw an error if request.method is not a string', function() {
    assert.throws(function() {
      new AuthRequestParser({ method: 1 }, {});
    }, Error);
  });

  it('should throw an error if request.headers is not an object', function() {
    assert.throws(function() {
      new AuthRequestParser({ headers: 'test', method: 'get' }, {});
    }, Error);
  });

  it('should allow the request.body to be null', function() {
    var parser = new AuthRequestParser({
      body: null,
      headers: {},
      method: 'get',
      url: 'test'
    }, ['body']);

    assert.equal(Object.keys(parser.body).length, 0);
  });
});
