'use strict';

var _ = require('underscore');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Tenant() {
  Tenant.super_.apply(this, arguments);
}
utils.inherits(Tenant, InstanceResource);

Tenant.prototype.getAccounts = function getTenantAccounts(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.accounts.href, options, require('./Account'), callback);
};

Tenant.prototype.getGroups = function getTenantGroups(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.groups.href, options, require('./Group'), callback);
};

Tenant.prototype.getApplications = function getTenantApplications(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.applications.href, options, require('./Application'), callback);
};

Tenant.prototype.getOrganizations = function getTenantOrganizations(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.organizations.href, options, require('./Organization'), callback);
};


Tenant.prototype.createApplication = function createTenantApplication(/* app, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var app = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  self.dataStore.createResource('/applications', options, app, require('./Application'), callback);
};

Tenant.prototype.createOrganization = function createTenantOrganization(/* app, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var app = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  self.dataStore.createResource('/organizations', options, app, require('./Organization'), callback);
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

  if (dir.provider){
    options = _.extend(options || {}, {expand:'provider'});
  }

  self.dataStore.createResource('/directories', options, dir, require('./Directory'), callback);
};

Tenant.prototype.verifyAccountEmail = function verifyAccountEmail(token, callback) {
  var self = this;
  var href = "/accounts/emailVerificationTokens/" + token;

  return self.dataStore.createResource(href, null, null, function(err,result){
    if(err){
      callback(err);
    }else{
      self.dataStore.getResource(result.href,{nocache:true},require('./Account'),callback);
    }
  });
};


Tenant.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.dataStore.getResource(self.customData.href, options, require('./CustomData'), callback);
};

module.exports = Tenant;
