'use strict';

var async = require('async');
var utils = require('../utils');

var Account = require('./Account');
var Application = require('./Application');
var CustomData = require('./CustomData');
var IdSiteModel = require('./IdSiteModel');
var OrganizationAccountStoreMapping = require('./OrganizationAccountStoreMapping');

/**
 * @class Organization
 *
 * @description
 *
 * Encapsulates a Organization resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Organization](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#organization).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link AccountStoreMapping#getAccountStore AccountStoreMapping.getAccountStore()}
 * - {@link Client#getOrganization Client.getOrganization()}
 * - {@link Client#getOrganizations Client.getOrganizations()}
 * - {@link Directory#getOrganizations Directory.getOrganizations()}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} organizationResource
 *
 * The JSON representation of this resource.
 *
 */
function Organization() {
  Organization.super_.apply(this, arguments);
}

utils.inherits(Organization, require('./InstanceResource'));

/**
 * Creates an {@link Account} in the organization's default account store.
 *
 * @param {AccountData} accountData
 * The data for the new account object.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Account} during this request.
 *
 * @param {Function} callback - Callback function, will be called with (err,
 * {@link Account}).
 *
 * @example
 *
 * var account = {
 *   givenName: 'Foo',
 *   surname: 'Bar',
 *   username: 'foolmeonce',
 *   email: 'foo@example.com',
 *   password: 'Changeme1!'
 * };
 *
 * organization.createAccount(account, function(err, createdAccount) {
 *   console.log(createdAccount);
 * });
 */
Organization.prototype.createAccount = function createAccount(/* account, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);
  return this.dataStore.createResource(this.accounts.href, args.options, args.account, Account, args.callback);
};

/**
 * Creates a group within the default group store of the Organization. If the
 * organization does not have a default group store, this will error.
 *
 * @param {Group} group
 * New group definition.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link Group}).
 *
 * @example
 *
 * var group = {
 *   name: 'New Users'
 * };
 *
 * organization.createGroup(group, function (err, group) {
 *   if (!err) {
 *     console.log('Group Created!');
 *   }
 * });
 */
Organization.prototype.createGroup = function createGroup(/* group, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback']);
  return this.dataStore.createResource(this.groups.href, args.options, args.group, require('./Group'), args.callback);
};

/**
 * Use this method to get an account from a provider directory. This method is
 * the same as {@link Application#getAccount Application.getAccount()} but
 * will be scoped to the account stores that are mapped to this Organization.
 *
 * @param {Object} providerAccountRequest
 * See {@link Application#getAccount Application.getAccount()}.
 *
 * @param {Function} callback
 * Callback function to call with parameters (`err`, {@link ProviderAccountResult}).
 *
 * @example
 *
 * var providerAccountRequest = {
 *   providerData: {
 *     providerId: 'facebook',
 *     accessToken: 'abc1235'
 *   }
 * };
 *
 * organization.getAccount(providerAccountRequest, function(err, providerAccountResult) {
 *   if (providerAccountResult.created) {
 *     console.log('This user was newly created in the directory.');
 *   }
 *
 *   console.log(providerAccountResult.account);
 * });
 */
Organization.prototype.getAccount = function () {
  Application.prototype.getAccount.apply(this, arguments);
};

/**
 * Get the account's collection for this Organization, which is a list of all
 * accounts in all account stores that are mapped to this organization.
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
 *
 * var query = {
 *   givenName: 'foo'
 * };
 *
 * organization.getAccounts(query, function(err, collection) {
 *   collection.each(function(account, next) {
 *     console.log('Found account for ' + account.givenName + ' (' + account.email + ')');
 *     next();
 *   });
 * });
 */
Organization.prototype.getAccounts = function getAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accounts.href, args.options, Account, args.callback);
};

/**
 * Gets the {@link CustomData} object for this resource.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link CustomData}).
 */
Organization.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, CustomData, args.callback);
};

/**
 * Retrieves the default {@link OrganizationAccountStoreMapping} for this
 * Organization, which represents the link to the default {@link Directory} or
 * {@link Group} for newly created accounts when  calling {@link Organization#createAccount
 * Organization.createAccount()}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For expanding the account store resource during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link OrganizationAccountStoreMapping}).
 *
 * @example
 *
 * organization.getDefaultAccountStoreMapping({ expand: 'accountStore' }, function(err, organizationAccountStoreMapping) {
 *   if (!err) {
 *     // Print the name of the default account store
 *     console.log(organizationAccountStoreMapping.accountStore.name);
 *   }
 * });
 */
Organization.prototype.getDefaultAccountStoreMapping = function getDefaultAccountStoreMapping(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultAccountStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultAccountStoreMapping.href, args.options, OrganizationAccountStoreMapping, args.callback);
};

/**
 * Retrieves the default {@link OrganizationAccountStoreMapping} for this
 * Organization, which represents the link to the default  {@link Group} for
 * newly created groups when calling {@link Organization#createGroup
 * Organization.createGroup()}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For expanding the account store resource during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link OrganizationAccountStoreMapping}).
 *
 * @example
 *
 * organization.getDefaultGroupStoreMapping({ expand: 'accountStore' }, function(err, organizationAccountStoreMapping) {
 *   if (!err) {
 *     // Print the name of the default group store
 *     console.log(organizationAccountStoreMapping.accountStore.name);
 *   }
 * });
 */
Organization.prototype.getDefaultGroupStoreMapping = function getDefaultGroupStoreMapping(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultGroupStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultGroupStoreMapping.href, args.options, OrganizationAccountStoreMapping, args.callback);
};

/**
 * Retrieves the default account store for this Organization, which is the
 * {@link Directory} or {@link Group} that new accounts will be created in when
 * calling {@link Organization#createAccount Organization.createAccount()}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the account store during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link Directory}|{@link Group}).
 *
 * @example
 *
 * organization.getDefaultAccountStore(function(err, accountStore) {
 *   if (!err) {
 *     // Print the name of the default account store
 *     console.log(accountStore.name);
 *   }
 * });
 */
Organization.prototype.getDefaultAccountStore = function getDefaultAccountStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getDefaultAccountStoreMapping({ expand: 'accountStore' }, function (err, organizationAccountStoreMapping) {
    if (err) {
      return args.callback(err);
    }

    if (!organizationAccountStoreMapping) {
      return args.callback(null, null);
    }

    organizationAccountStoreMapping.getAccountStore(args.options, args.callback);
  });
};

/**
 * Retrieves the default group store for this Organization, which is the
 * {@link Group} that new groups will be created in when calling
 * {@link Organization#createGroup Organization.createGroup()}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the account store during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link Group}).
 *
 * @example
 *
 * organization.getDefaultGroupStore(function(err, accountStore) {
 *   if (!err) {
 *     // Print the name of the default group store
 *     console.log(accountStore.name);
 *   }
 * });
 */
Organization.prototype.getDefaultGroupStore = function getDefaultGroupStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getDefaultGroupStoreMapping({ expand: 'accountStore' }, function (err, organizationAccountStoreMapping) {
    if (err) {
      return args.callback(err);
    }

    if (!organizationAccountStoreMapping) {
      return args.callback(null, null);
    }

    organizationAccountStoreMapping.getAccountStore(args.options, args.callback);
  });
};

/**
 * Get the groups collection for this Organization, which is a list of all
 * groups that are directly mapped to the organization, and all groups that
 * exist in a directory that is mapped to the organization.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `name`, `description`, `status`.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Group} objects.
 *
 * @example
 *
 * var query = {
 *   name: 'admins'
 * };
 *
 * organization.getGroups(query, function(err, collection) {
 *   if (collection && collection.items.length === 1) {
 *     console.log('Found the admins group, href is: ' + group.href);
 *   }
 * });
 */
Organization.prototype.getGroups = function getGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

/**
 * Not yet documented, as this is not yet unique to the organization, this is
 * internally bound to the application.
 *
 * @private
 */
Organization.prototype.getIdSiteModel = function getIdSiteModel(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.idSiteModel.href, args.options, IdSiteModel, args.callback);
};

/**
 * Retrieves the list of {@link OrganizationAccountStoreMapping Organization
 * Account Store Mappings} for this organization.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link OrganizationAccountStoreMapping} objects.
 *
 * @example
 *
 * organization.getAccountStoreMappings({ expand: 'accountStore' }, function(err, accountStoreMappings) {
 *   if (!err) {
 *     console.log(accountStoreMappings.items);
 *   }
 * });
 */
Organization.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountStoreMappings.href, args.options, OrganizationAccountStoreMapping, args.callback);
};

/**
 * Creates a mapping between this Organization and an Account Store, the Account
 * Store can be a {@link Directory} or {@link Group}.
 *
 * @param {Object} accountStoreMapping
 *
 * @param {Directory|Group|Object} accountStoreMapping.accountStore
 * The Account Store to set as the default Account Store for this organization.
 * This can be a materialized {@link Directory}, {@link Group}, or object
 * literal with an `href` property that identifies the Account Store.
 *
 * @param {Boolean} [accountStoreMapping.isDefaultAccountStore=false] Set to
 * `true` if you want this account store to be the default store where new accounts
 * are placed when calling {@link Organization#createAccount Organization.createAccount()}.
 * If you need to change the default account store in the future, use
 * {@link Organization#setDefaultAccountStore Organization.setDefaultAccountStore()}
 *
 * @param {Boolean} [accountStoreMapping.isDefaultGroupStore=false] Set to
 * `true` if you want this account store to be the default location of groups when
 * calling {@link Organization#createGroup Organization.createGroup()}.
 * In this situation, the account store must be a {@link Directory}.  If you
 * need to change the default group store in the future, use
 * {@link Organization#setDefaultGroupStore Organization.setDefaultGroupStore()}
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link OrganizationAccountStoreMapping}).
 *
 * @example
 *
 * client.getDirectory(directoryHref, function(err, directory}{
 *   organization.createAccountStoreMapping({ accountStore: directory }, function (err, organizationAccountStoreMapping) {
 *     if (!err) {
 *       console.log('Directory was mapped to the organization.');
 *     }
 *   });
 * })
 *
 * @example
 *
 * var mapping = {
 *   accountStore: {
 *     href: 'https://api.stormpath.com/v1/directories/xxx'
 *   }
 * };
 *
 * organization.createAccountStoreMapping(mapping, function (err, organizationAccountStoreMapping) {
 *   if (!err) {
 *     console.log('Directory was mapped to the organization.');
 *   }
 * });
 *
 */
Organization.prototype.createAccountStoreMapping = function createAccountStoreMapping(/* mapping, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['mapping', 'options', 'callback']);

  args.mapping = new OrganizationAccountStoreMapping(args.mapping).setOrganization(this);

  return this.dataStore.createResource('/organizationAccountStoreMappings', args.options, args.mapping, OrganizationAccountStoreMapping, args.callback);
};

/**
 * Used to create multiple account store mappings at once.
 *
 * @param  {Object[]} mappings
 * An array of mapping definitions, the same that you would pass to {@link
 * Organization#createAccountStoreMapping Organization.createAccountStoreMapping()}.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, [{@link OrganizationAccountStoreMapping
 * OrganizationAccountStoreMappings}]).
 */
Organization.prototype.createAccountStoreMappings = function createAccountStoreMappings(mappings, callback) {
  async.mapSeries(mappings, function(mapping, next) {
    this.createAccountStoreMapping(mapping, next);
  }.bind(this), callback);
};

/**
 * Sets the default Account Store for this Organization by setting the
 * `isDefaultAccountStore` property of the {@link OrganizationAccountStoreMapping} that
 * represents the link between this Organization and the account store.  If this
 * mapping does not already exist it will be automatically created.
 *
 * @param {Directory|Group|Object} accountStore
 * The Account Store to set as the default Account Store for this organization.
 * This can be a materialized {@link Directory}, {@link Group}, or object
 * literal with an `href` property that identifies the Account Store.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link OrganizationAccountStoreMapping}).
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * client.getDirectory(directoryHref, function(err, directory){
 *   organization.setDefaultAcccountStore(directory, function (err) {
 *     if (!err) {
 *       console.log('Directory was set as default account store');
 *     }
 *   });
 * })
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * organization.setDefaultAcccountStore({href: directoryHref}, function (err) {
 *   if (!err) {
 *     console.log('Directory was set as default account store');
 *   }
 * });
 *
 */
Organization.prototype.setDefaultAccountStore = function setDefaultAccountStore(store, callback) {
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  this.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }

    res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href);}, onAsmFound);
  });

  function onAsmFound(asm) {
    if (asm) {
      asm.isDefaultAccountStore = true;
      return asm.save(clearCache);
    }

    var mapping = new OrganizationAccountStoreMapping({ isDefaultAccountStore: true })
      .setOrganization(self)
      .setAccountStore(store);

    return self.dataStore.createResource('/accountStoreMappings', null, mapping, OrganizationAccountStoreMapping, clearCache);
  }

  function clearCache(err, map) {
    if (err) {
      return callback(err);
    }

    self.dataStore._evict(self.href, function(err){
      if (err) {
        return callback(err);
      }

      callback(null, map);
    });
  }
};

/**
 * Sets the default Group Store for this Organization by setting the
 * `isDefaultGroupStore` property of the {@link AccountStoreMapping} that
 * represents the link between this organization and the account store.  If this
 * mapping does not already exist it will be automatically created.
 *
 * @param {Directory|Object} directory
 * The {@link Directory} to set as the default group store for this organization.
 * This can be a materialized {@link Directory}, or object literal with an
 * `href` property that identifies the {@link Directory}.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link OrganizationAccountStoreMapping}).
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * client.getDirectory(directoryHref, function(err, directory}{
 *   organization.setDefaultGroupStore(directory, function (err, organizationAccountStoreMapping) {
 *     if (!err) {
 *       console.log('Directory was set as default group store');
 *     }
 *   });
 * })
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * organization.setDefaultGroupStore({href: directoryHref}, function (err) {
 *   if (!err) {
 *     console.log('Directory was set as default group store');
 *   }
 * });
 *
 */
Organization.prototype.setDefaultGroupStore = function setDefaultGroupStore(store, callback) {
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  this.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }
    res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href);}, onAsmFound);
  });

  function onAsmFound(asm) {
    if (asm) {
      asm.isDefaultGroupStore = true;
      return asm.save(updateApp);
    }

    var mapping = new OrganizationAccountStoreMapping({ isDefaultGroupStore: true })
      .setOrganization(self)
      .setAccountStore(store);

    return self.dataStore.createResource('/accountStoreMappings', null, mapping, OrganizationAccountStoreMapping, updateApp);
  }

  function updateApp(err, map) {
    if (err) {
      return callback(err);
    }

    self.dataStore._evict(self.href, function(err){
      if (err) {
        return callback(err);
      }

      callback(null, map);
    });
  }
};

/**
* Retrieves the organization's {@link AccountLinkingPolicy}, which determines if
* and how accounts in its default account store are linked, so that {@link AccountLink}
* instances are automatically created between two accounts that would match this policy.
*
* @param {ExpansionOptions} options
* Options for expanding the account linking policy. Can be expanded on `tenant`.
*
* @param {Function} callback
* The function that will be called when the query is finished, with the parameters
* (err, {@link AccountLinkingPolicy}).
*/
Organization.prototype.getAccountLinkingPolicy = function getOrganizationAccountLinkingPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.accountLinkingPolicy.href, args.options, require('./AccountLinkingPolicy'), args.callback);
};

module.exports = Organization;
