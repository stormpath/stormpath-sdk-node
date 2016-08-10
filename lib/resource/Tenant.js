'use strict';

var _ = require('underscore');
var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Tenant
 *
 * @description
 * Encapsulates a Stormpath Tenant resource, which is the root node of all the
 * resources for a given tenant. For full documentation of this resource, please see
 * [REST API Reference: Tenant](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#tenant).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Client#getCurrentTenant Client.getCurrentTenant()}
 *
 * For convenience, some of these methods also exist on an instance of {@link Client},
 * where they are bound to the current tenant, as identified by the API Key Pair
 * that was passed to the Client constructor.
 *
 * @param {Object} tenantResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function Tenant() {
  Tenant.super_.apply(this, arguments);
}

utils.inherits(Tenant, InstanceResource);

/**
 * Get the collection of {@link Account accounts} for this tenant.
 *
 * @param {CollectionQueryOptions} [options]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Account} objects.
 */
Tenant.prototype.getAccounts = function getTenantAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

/**
 * Get the collection of {@link Group groups} for this tenant.
 *
 * @param {CollectionQueryOptions} [options]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Group} objects.
 */
Tenant.prototype.getGroups = function getTenantGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

/**
 * Get the collection of {@link Application applications} for this tenant.
 *
 * @param {CollectionQueryOptions} [options]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Application} objects.
 */
Tenant.prototype.getApplications = function getTenantApplications(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.applications.href, args.options, require('./Application'), args.callback);
};

/**
 * Get the collection of {@link Organization organizations} for this tenant.
 *
 * @param {CollectionQueryOptions} [options]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Organization} objects.
 */
Tenant.prototype.getOrganizations = function getTenantOrganizations(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organizations.href, args.options, require('./Organization'), args.callback);
};

/**
 * Creates a new Application resource.
 *
 * @param {Object} application
 * The {@link Application} resource to create.
 *
 * @param {ExpansionOptions} [options]
 * Options to expand linked resources on the returned {@link Application}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Application}).
 */
Tenant.prototype.createApplication = function createTenantApplication(/* app, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);
  this.dataStore.createResource('/applications', args.options, args.app, require('./Application'), args.callback);
};

/**
 * Creates a new {@link Organization} resource. After creating a organization, you will
 * likely want to map it to an {@link Application} using
 * {@link Application#createAccountStoreMapping Application.createAccountStoreMapping()}.
 *
 * @param {Object} organization
 * The {@link Organization} resource to create.
 *
 * @param {ExpansionOptions} [options]
 * Options to expand linked resources on the returned {@link Organization}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Organization}).
 */
Tenant.prototype.createOrganization = function createTenantOrganization(/* app, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);
  this.dataStore.createResource('/organizations', args.options, args.app, require('./Organization'), args.callback);
};

/**
 * Get the collection of {@link Directory directories} for this tenant.
 *
 * @param {CollectionQueryOptions} [options]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Directory} objects.
 */
Tenant.prototype.getDirectories = function getTenantDirectories(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.directories.href, args.options, require('./Directory'), args.callback);
};

/*
 * Creates a new {@link Directory} resource. After creating a directory, you will
 * likely want to map it to an {@link Application} using
 * {@link Application#createAccountStoreMapping Application.createAccountStoreMapping()}.
 *
 * @param {Object} directory
 * The {@link Directory} resource to create.
 *
 * @param {ExpansionOptions} [options]
 * Options to expand linked resources on the returned {@link Directory}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Directory}).
 *
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
 * @param {String} token
 * The token that was sent to the user.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link Account}).
 *
 * @example
 * var token = '2QTr9Gzzq444ojxq3H9NQX';
 *
 * tenant.verifyAccountEmail(token, function (err, account) {
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
 * Gets the {@link CustomData} object for this resource.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link CustomData}).
 */
Tenant.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = Tenant;
