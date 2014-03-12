'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function Tenant() {
  Tenant.super_.apply(this, arguments);
}
utils.inherits(Tenant, InstanceResource);

Tenant.prototype.getApplications = function getTenantApplications(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.applications.href, options, require('./Application'), callback);
};

Tenant.prototype.createApplication = function createTenantApplication(/* app, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var app = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  self.dataStore.createResource('/applications', options, app, require('./Application'), callback);
};

Tenant.prototype.getDirectories = function getTenantDirectories(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.directories.href, options, require('./Directory'), callback);
};

Tenant.prototype.createDirectory = function createTenantDirectory(/* dir, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var dir = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  self.dataStore.createResource('/directories', options, dir, require('./Directory'), callback);
};

Tenant.prototype.verifyAccountEmail = function verifyAccountEmail(token, callback) {
  var self = this;
  var href = "/accounts/emailVerificationTokens/" + token;

  return self.dataStore.createResource(href, null /* no request body */, require('./Account'), callback);
};

module.exports = Tenant;