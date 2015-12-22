'use strict';
var utils = require('../utils');

var AccountStoreMapping = require('./AccountStoreMapping');

function ApplicationAccountStoreMapping() {
  ApplicationAccountStoreMapping.super_.apply(this, arguments);
}

utils.inherits(ApplicationAccountStoreMapping, AccountStoreMapping);

ApplicationAccountStoreMapping.prototype.getApplication = function getApplication(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.application.href, options, require('./Application'), callback);
};

ApplicationAccountStoreMapping.prototype.setApplication = function setApplication(application) {
  this.application = { href: application.href };
  return this;
};

module.exports = ApplicationAccountStoreMapping;
