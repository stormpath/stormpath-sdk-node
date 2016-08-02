'use strict';

var _ = require('underscore');
var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Tenant
 *
 * @description
 *
 * Encapsulates a Stormpath Tenant resource, which is the root node of all the
 * resources for a given tenant.  For full documentation of this resource,
 * please see
 * [REST API Reference: Tenant](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#tenant).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Client#getCurrentTenant Client.getCurrentTenant()}
 *
 * @param {Object} tenantResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 *
 */
function Tenant() {
  Tenant.super_.apply(this, arguments);
}

utils.inherits(Tenant, InstanceResource);

/**
 * Not documented as this is proxied by client.getAccounts()
 *
 * @private
 */
Tenant.prototype.getAccounts = function getTenantAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

/**
 * Not documented as this is proxied by client.getTenantGroups()
 *
 * @private
 */
Tenant.prototype.getGroups = function getTenantGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

/**
 * Not documented as this is proxied by client.getApplications()
 *
 * @private
 */
Tenant.prototype.getApplications = function getTenantApplications(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.applications.href, args.options, require('./Application'), args.callback);
};

/**
 * Not documented as this is proxied by client.getOrganizations()
 *
 * @private
 */
Tenant.prototype.getOrganizations = function getTenantOrganizations(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organizations.href, args.options, require('./Organization'), args.callback);
};

/**
 * Not documented as this is proxied by client.createApplication()
 *
 * @private
 */
Tenant.prototype.createApplication = function createTenantApplication(/* app, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);
  this.dataStore.createResource('/applications', args.options, args.app, require('./Application'), args.callback);
};

/**
 * Not documented as this is proxied by client.createOrganization()
 *
 * @private
 */
Tenant.prototype.createOrganization = function createTenantOrganization(/* app, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);
  this.dataStore.createResource('/organizations', args.options, args.app, require('./Organization'), args.callback);
};

/**
 * Not documented as this is proxied by client.getDirectories()
 *
 * @private
 */
Tenant.prototype.getDirectories = function getTenantDirectories(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.directories.href, args.options, require('./Directory'), args.callback);
};

/**
 * Not documented as this is proxied by client.createDirectory()
 *
 * @private
 */
Tenant.prototype.createDirectory = function createTenantDirectory(/* dir, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['dir', 'options', 'callback']);

  if (args.dir.provider){
    args.options = _.extend(args.options || {}, {expand:'provider'});
  }

  this.dataStore.createResource('/directories', args.options, args.dir, require('./Directory'), args.callback);
};

/**
 * Verifies an account-specific email verification token, obtaining the verified
 * Account and providing it to the specified callback.  This is the token that
 * is sent to the user by email, so they need to click on the link and arrive on
 * your site with this query parameter in the URL.  Once you fetch the parameter
 * from the URL you will call this function.
 *
 * @param {String} token The token that was sent to the user
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link Account}).
 *
 * @example
 *
 * var token = '2QTr9Gzzq444ojxq3H9NQX';
 *
 * tenant.verifyAccountEmail(token, function(err, account) {
 *   console.log(account);
 * });
 */
Tenant.prototype.verifyAccountEmail = function verifyAccountEmail(token, callback) {
  var dataStore = this.dataStore;
  var href = "/accounts/emailVerificationTokens/" + token;

  return dataStore.createResource(href, null, null, function(err,result){
    if(err){
      callback(err);
    }else{
      dataStore._evict(result.href, function (err) {
        if(err){
          callback(err);
        }else{
          dataStore.getResource(result.href,{nocache:true},require('./Account'),callback);
        }
      });
    }
  });
};


/**
 * Gets the custom data object for this resource.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link CustomData}).
 */
Tenant.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = Tenant;
