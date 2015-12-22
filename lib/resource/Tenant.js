'use strict';

var _ = require('underscore');
var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function Tenant() {
  Tenant.super_.apply(this, arguments);
}

utils.inherits(Tenant, InstanceResource);

Tenant.prototype.getAccounts = function getTenantAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

Tenant.prototype.getGroups = function getTenantGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

Tenant.prototype.getApplications = function getTenantApplications(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.applications.href, args.options, require('./Application'), args.callback);
};

Tenant.prototype.getOrganizations = function getTenantOrganizations(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organizations.href, args.options, require('./Organization'), args.callback);
};

Tenant.prototype.createApplication = function createTenantApplication(/* app, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);
  this.dataStore.createResource('/applications', args.options, args.app, require('./Application'), args.callback);
};

Tenant.prototype.createOrganization = function createTenantOrganization(/* app, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);
  this.dataStore.createResource('/organizations', args.options, args.app, require('./Organization'), args.callback);
};

Tenant.prototype.getDirectories = function getTenantDirectories(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.directories.href, args.options, require('./Directory'), args.callback);
};

Tenant.prototype.createDirectory = function createTenantDirectory(/* dir, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['dir', 'options', 'callback']);

  if (args.dir.provider){
    args.options = _.extend(args.options || {}, {expand:'provider'});
  }

  this.dataStore.createResource('/directories', args.options, args.dir, require('./Directory'), args.callback);
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
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = Tenant;
