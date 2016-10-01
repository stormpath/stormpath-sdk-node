'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Phone() {
  Phone.super_.apply(this, arguments);
}

utils.inherits(Phone, InstanceResource);

Phone.prototype.getAccount = function getPhoneAccount(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.account.href, args.options, require('./Account'), args.callback);
};

module.exports = Phone;
