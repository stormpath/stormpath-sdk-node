'use strict';

var Factor = require('./Factor');
var utils = require('../utils');

function SmsFactor() {
  SmsFactor.super_.apply(this, arguments);
}

utils.inherits(SmsFactor, Factor);

SmsFactor.prototype.getPhone = function getPhone(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.phone.href, args.options, require('./Phone'), args.callback);
};

module.exports = SmsFactor;
