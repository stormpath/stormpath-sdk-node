/*jshint expr: true*/
/*jshint unused: false*/
'use strict';

var utils = require('../lib/utils'),
  chai = require('chai'),
  should = chai.should();

chai.use(require('sinon-chai'));
require('mocha-sinon');

describe('util', function () {
  it('isAssignableFrom should work', function () {

    var A = function A(){};

    var B = function B() {
      A.super_.apply(this, arguments);
    };
    utils.inherits(B, A);

    utils.isAssignableFrom(Object, A).should.equal(true);

    utils.isAssignableFrom(Object, B).should.equal(true);

    utils.isAssignableFrom(A, B).should.equal(true);

    utils.isAssignableFrom(B, A).should.equal(false);

    utils.isAssignableFrom(B, Object).should.equal(false);

    utils.isAssignableFrom(A, Object).should.equal(false);

  });
});
