"use strict";

var _ = require('lodash');
//_.extend(process.env, require('./test.env'));

var chai = require("chai");
var nock = require("nock");
var sinon = require("sinon");
var assert = require('chai').assert;
var expect = require("chai").expect;
var should = require("chai").should();
var AssertionError = require("chai").AssertionError;
var sinonChai = require("sinon-chai");
var Stormpath = require('../lib');
chai.use(sinonChai);

module.exports = {
  _: _,
  chai: chai,
  sinon: sinon,
  assert: assert,
  config: process.env,
  should: should,
  Stormpath: Stormpath
};