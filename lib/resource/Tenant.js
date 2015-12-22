'use strict';

var _ = require('underscore');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Tenant() {
  Tenant.super_.apply(this, arguments);
}
utils.inherits(Tenant, InstanceResource);

Tenant.prototype.getAccounts = function getTenantAccounts(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.accounts.href, options, require('./Account'), callback);
};

Tenant.prototype.getGroups = function getTenantGroups(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.groups.href, options, require('./Group'), callback);
};

Tenant.prototype.getApplications = function getTenantApplications(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.applications.href, options, require('./Application'), callback);
};

Tenant.prototype.getOrganizations = function getTenantOrganizations(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.organizations.href, options, require('./Organization'), callback);
};


Tenant.prototype.createApplication = function createTenantApplication(/* app, [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var app = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.dataStore.createResource('/applications', options, app, require('./Application'), callback);
};

Tenant.prototype.createOrganization = function createTenantOrganization(/* app, [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var app = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.dataStore.createResource('/organizations', options, app, require('./Organization'), callback);
};

Tenant.prototype.getDirectories = function getTenantDirectories(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.directories.href, options, require('./Directory'), callback);
};

Tenant.prototype.createDirectory = function createTenantDirectory(/* dir, [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var dir = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  if (dir.provider){
    options = _.extend(options || {}, {expand:'provider'});
  }

  this.dataStore.createResource('/directories', options, dir, require('./Directory'), callback);
};

Tenant.prototype.verifyAccountEmail = function verifyAccountEmail(token, callback) {
  var dataStore = this.dataStore;
  var href = "/accounts/emailVerificationTokens/" + token;

  return dataStore.createResource(href, null, null, function(err,result){
    if(err){
      callback(err);
    }else{
      dataStore.getResource(result.href,{nocache:true},require('./Account'),callback);
    }
  });
};


Tenant.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.dataStore.getResource(this.customData.href, options, require('./CustomData'), callback);
};

module.exports = Tenant;
