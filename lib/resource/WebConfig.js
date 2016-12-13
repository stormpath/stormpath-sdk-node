'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function WebConfig() {
  WebConfig.super_.apply(this, arguments);
}

utils.inherits(WebConfig, InstanceResource);

WebConfig.prototype.getApplication = function getWebConfigApplication(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.application.href, args.options, require('./Application'), args.callback);
};

WebConfig.prototype.getSigningApiKey = function getSigningApiKey(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.signingApiKey.href, args.options, require('./ApiKey'), args.callback);
};

WebConfig.prototype.getTenant = function getWebConfigTenant(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

module.exports = WebConfig;