"use strict";

var _ = require('lodash');
//_.extend(process.env, require('./test.env'));

var chai = require("chai");
var nock = require('nock');
var sinon = require("sinon");
var assert = require('chai').assert;
var should = require("chai").should();
var moment = require('moment');
var sinonChai = require("sinon-chai");
var uuid = require('uuid');
var nock = require('nock');
var timekeeper = require('timekeeper');
var jwt = require('njwt');

var Stormpath = require('../lib');
chai.use(sinonChai);

function u(){}
u.BASE_URL = 'https://api.stormpath.com';
/** adds '/v1' to relative URL, to work with nock request mocker  */
u.v1 = function(s){return '/v1' + s;};

function random(){
  return '' + Math.random()*Date.now();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshotEnv() {
  var originalEnv = clone(process.env);
  return function restore() {
    var key;
    for (key in process.env) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    for (key in originalEnv) {
      process.env[key] = originalEnv[key];
    }
  };
}

function assertAccessTokenResponse(response){
  assert.isDefined(response.accessTokenResponse);
  assert.isDefined(response.accessTokenResponse.access_token);
  assert.isDefined(response.accessTokenResponse.refresh_token);
  assert.isDefined(response.accessToken);
  assert.isDefined(response.refreshToken);
}

function assertPasswordGrantResponse(done){
  return function(err,response){
    assert.isNull(err);
    assert.instanceOf(response,Stormpath.OauthPasswordGrantAuthenticationResult);
    assertAccessTokenResponse(response);
    done();
  };
}

module.exports = {
  _: _,
  u: u,
  chai: chai,
  nock: nock,
  sinon: sinon,
  assert: assert,
  expect: chai.expect,
  config: process.env,
  should: should,
  moment: moment,
  Stormpath: Stormpath,
  timekeeper: timekeeper,
  random: random,
  uuid: uuid,
  jwt: jwt,
  snapshotEnv: snapshotEnv,
  assertPasswordGrantResponse: assertPasswordGrantResponse,
  assertAccessTokenResponse: assertAccessTokenResponse
};
