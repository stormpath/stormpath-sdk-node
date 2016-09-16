'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Directory
 *
 * @description
 * Encapsulates a Directory resource. For full documentation of this resource, please see
 * [REST API Reference: Directory](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#directory).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#getDirectory Account.getDirectory()}
 * - {@link AccountStoreMapping#getAccountStore AccountStoreMapping.getAccountStore()}
 * - {@link Client#getDirectory Client.getDirectory()}
 * - {@link Client#getDirectories Client.getDirectories()}
 * - {@link Group#getDirectory Group.getDirectory()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} directoryResource
 * The JSON representation of this resource, retrieved the Stormpath REST API.
 */
function Directory() {
  Directory.super_.apply(this, arguments);
}

utils.inherits(Directory, InstanceResource);

/**
 * Get the account's collection, which is a list of all the accounts in this
 * Directory.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `createdAt`, `email`, `givenName`, `middleName`, `modifiedAt`, `surname`,
 * `status`, `username`.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Account} objects.
 *
 * @example
 * var query = {
 *   email: 'foo@example.com'
 * };
 *
 * directory.getAccounts(query, function(err, collection) {
 *   collection.each(function(account, next) {
 *     console.log('Found account for ' + account.givenName + ' (' + account.email + ')');
 *     next();
 *   });
 * });
 */
Directory.prototype.getAccounts = function getDirectoryAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, require('./Account'), args.callback);
};

/**
 * Get the {@link AccountCreationPolicy} resource of this Directory resource.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link AccountCreationPolicy} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link AccountCreationPolicy}).
 */
Directory.prototype.getAccountCreationPolicy = function getAccountCreationPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountCreationPolicy.href, args.options, require('./InstanceResource'), args.callback);
};

/**
 * Get the {@link Schema} resource of this Directory resource. The schema allows
 * you to control which attributes are required when accounts are created in this
 * directory.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Schema} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Schema}).
 */
Directory.prototype.getAccountSchema = function getAccountSchema(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountSchema.href, args.options, require('./Schema'), args.callback);
};

/**
 * Get the {@link PasswordPolicy} resource of this Directory resource.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link PasswordPolicy} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link PasswordPolicy}).
 */
Directory.prototype.getPasswordPolicy = function getPasswordPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.passwordPolicy.href, args.options, require('./PasswordPolicy'), args.callback);
};

/**
 * Creates an {@link Account} in this directory.
 *
 * @param {AccountData} accountData
 * The data for the new account object.
 *
 * @param {Object} [requestOptions]
 * Query parameters for this request.  These  can be any of the {@link ExpansionOptions},
 * e.g. to retrieve linked resources of the {@link Account} during this request, or one
 * of the other options listed below.
 *
 * @param {Boolean} [requestOptions.registrationWorkflowEnabled=null]
 * Set this to `false` if you need to disable the email verification workflow while
 * creating this account.  This is typically used when importing accounts from
 * another system.
 *
 * @param {Function} callback - Callback function, will be called with (err,
 * {@link Account}).
 *
 * @example
 * var account = {
 *   givenName: 'Foo',
 *   surname: 'Bar',
 *   username: 'foolmeonce',
 *   email: 'foo@example.com',
 *   password: 'Changeme1!'
 * };
 *
 * directory.createAccount(account, function (err, createdAccount) {
 *   console.log(createdAccount);
 * });
 */
Directory.prototype.createAccount = function createDirectoryAccount(/* account, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);
  return this.dataStore.createResource(this.accounts.href, args.options, args.account, require('./Account'), args.callback);
};

/**
 * Retrieves a list of all the groups that are in this directory.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Group} objects.
 *
 * @example
 * directory.getGroups(function (err, groupsCollection) {
 *   groupsCollection.each(function(group, next) {
 *     console.log(group.name);
 *     next();
 *   });
 * });
 */
Directory.prototype.getGroups = function getDirectoryGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

/**
 * Creates a {@link Group} in this directory.
 *
 * @param {Object} groupData
 * The new group data.
 *
 * @param {String} [groupData.description]
 * A description of this group.
 *
 * @param {String} groupData.name
 * The name of the group.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Group}).
 *
 * @example
 * var newGroup = {
 *   name: 'Customers',
 *   description: 'Users who have registered through the e-commerce site.'
 * };
 *
 * directory.createGroup(newGroup, function (err, group) {
 *   console.log(group.href);
 * });
 */
Directory.prototype.createGroup = function createDirectoryGroup(/* group, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback']);
  return this.dataStore.createResource(this.groups.href, args.options, args.group, require('./Group'), args.callback);
};

/**
 * Get the {@link Tenant} resource that owns this directory.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Tenant} resources during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Tenant}).
 */
Directory.prototype.getTenant = function getDirectoryTenant(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

/**
 * Get the {@link Provider} resource of this directory, this resource tells you
 * what type of directory this is.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link Provider}|{@link SamlProvider}).
 */
Directory.prototype.getProvider = function getProvider(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.provider){
    return args.callback();
  }

  function providerFactory(provider, dataStore) {
    var providerName = 'Provider';

    if (provider.providerId === 'saml') {
      providerName = 'SamlProvider';
    }

    var ProviderType = require('./' + providerName);

    return new ProviderType(provider, dataStore);
  }

  return this.dataStore.getResource(this.provider.href, args.options, providerFactory, args.callback);
};

/**
 * Retrieves a list of all the {@link Organization Organizations} that this
 * directory is mapped to.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Organization} objects.
 *
 * @example
 * directory.getOrganizations(function (err, organizationsCollection) {
 *   organizationsCollection.each(function(organization, next) {
 *     console.log(organization.name);
 *     next();
 *   });
 * });
 */
Directory.prototype.getOrganizations = function getOrganizations(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organizations.href, args.options, require('./Organization'), args.callback);
};

/**
 * Retrieves a list of all the {@link OrganizationAccountStoreMapping
 * OrganizationAccountStoreMappings}, that represent the mappings between this
 * directory and the specified {@link Organization Organizations}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link OrganizationAccountStoreMapping} objects.
 *
 * @example
 * directory.getOrganizationMappings(function (err, organizationMappingsCollection) {
 *   organizationMappingsCollection.each(function(mapping, next) {
 *     console.log(mapping.href);
 *     next();
 *   });
 * });
 */
Directory.prototype.getOrganizationMappings = function getOrganizationMappings(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.organizationMappings.href, args.options, require('./OrganizationAccountStoreMapping'), args.callback);
};

/**
 * Gets the {@link CustomData} object for this resource.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link CustomData}).
 */
Directory.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

module.exports = Directory;
