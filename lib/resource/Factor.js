'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Factor() {
  Factor.super_.apply(this, arguments);
}

utils.inherits(Factor, InstanceResource);

Factor.prototype.getAccount = function getFactorAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

Factor.prototype.createChallenge = function createFactorChallenge(/* challenge, callback */) {
  var args = utils.resolveArgs(arguments, ['challenge', 'callback']);
  return this.dataStore.createResource(this.challenges.href, args.options, args.challenge, require('./Challenge'), args.callback);
};

Factor.prototype.getChallenges = function getFactorChallenges(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback']);
  return this.dataStore.getResource(this.challenges.href, args.options, require('./Challenge'), args.callback);
};

module.exports = Factor;
