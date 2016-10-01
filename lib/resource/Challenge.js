'use strict';

var InstanceResource = require('./InstanceResource');
var FactorCtor = require('./FactorInstantiator').Constructor;
var utils = require('../utils');

function Challenge() {
  Challenge.super_.apply(this, arguments);
}

utils.inherits(Challenge, InstanceResource);

Challenge.prototype.getFactor = function getFactor(/* [options], cb */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.factor.href, args.options, FactorCtor, args.callback);
};

Challenge.prototype.getAccount = function getAccount(/* [options], cb */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

module.exports = Challenge;
