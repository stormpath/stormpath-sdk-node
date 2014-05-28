"use strict";

var _ = require('lodash');
//_.extend(process.env, require('./test.env'));

var chai = require("chai");
var sinon = require("sinon");
var assert = require('chai').assert;
var should = require("chai").should();
var moment = require('moment');
var sinonChai = require("sinon-chai");
var uuid = require('node-uuid');
var nock = require('nock');

var Stormpath = require('../lib');
chai.use(sinonChai);

function random(){
  return '' + Math.random()*Date.now();
}

module.exports = {
  _: _,
  chai: chai,
  sinon: sinon,
  assert: assert,
  expect: chai.expect,
  config: process.env,
  should: should,
  moment: moment,
  Stormpath: Stormpath,
  random: random,
  uuid: uuid,
  nock: nock
};