/*jshint expr: true*/
/*jshint unused: false*/
'use strict';

var util = require('../lib/util'),
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
    util.inherits(B, A);

    util.isAssignableFrom(Object, A).should.equal(true);

    util.isAssignableFrom(Object, B).should.equal(true);

    util.isAssignableFrom(A, B).should.equal(true);

    util.isAssignableFrom(B, A).should.equal(false);

    util.isAssignableFrom(B, Object).should.equal(false);

    util.isAssignableFrom(A, Object).should.equal(false);

  });
});
