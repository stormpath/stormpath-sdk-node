'use strict';

var utils = require('../utils');
var AccountStoreMapping = require('./AccountStoreMapping');

function ApplicationAccountStoreMapping() {
  ApplicationAccountStoreMapping.super_.apply(this, arguments);
}

utils.inherits(ApplicationAccountStoreMapping, AccountStoreMapping);

ApplicationAccountStoreMapping.prototype.getApplication = function getApplication(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.application.href, args.options, require('./Application'), args.callback);
};

ApplicationAccountStoreMapping.prototype.setApplication = function setApplication(application) {
  this.application = { href: application.href };
  return this;
};

module.exports = ApplicationAccountStoreMapping;
