"use strict";

var _ = require('lodash');
//_.extend(process.env, require('./test.env'));

var chai = require("chai");
var sinon = require("sinon");
var assert = require('chai').assert;
var should = require("chai").should();
var moment = require('moment');
var sinonChai = require("sinon-chai");

var Stormpath = require('../lib');
chai.use(sinonChai);

module.exports = {
  _: _,
  chai: chai,
  sinon: sinon,
  assert: assert,
  expect: chai.expect,
  config: process.env,
  should: should,
  moment: moment,
  Stormpath: Stormpath
};