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
 * - {@link AccountLinkingPolicy#getTenant AccountLinkingPolicy.getTenant()}
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
  return this.dataStore.getResource(this._links.users.href, args.options, require('./Account'), function (err, collection) {
    if (err) {
      return args.callback(err);
    }
    collection.items.forEach(function (account) {
      account.transformOktaUser();
    });
    args.callback(err, collection);
  });
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
  var Group = require('./Group');
  return this.dataStore.getResource(this._links.groups.href, args.options, Group, Group.prototype.oktaGroupCollectionFilter.bind(null, args.callback));
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
 * @param {Object} [requestOptions]
 * Query parameters for this request. These can be any of the {@link ExpansionOptions},
 * e.g. to retrieve linked resources of the {@link Application} during this request, or one
 * of the other options listed below.
 *
 * @param {Boolean|String} [requestOptions.createDirectory]
 * Set this to `true` to have a a new {@link Directory} automatically created along with the Application.
 * The generated Directory’s name will reflect the new Application’s name as best as is possible,
 * guaranteeing that it is unique compared to any of your existing Directories. If you would like
 * a different name, simply put the value you would like instead of `true`.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Application}).
 */
Tenant.prototype.createApplication = function createTenantApplication(/* app, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);
  this.dataStore.createResource('/apps', args.options, args.app, require('./Application'), args.callback);
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
 * Creates a new SmtpServer resource.
 *
 * @param {Object} server
 * The {@link SmtpServer} resource to create.
 *
 * @param {ExpansionOptions} [options]
 * Options to expand linked resources on the returned {@link SmtpServer}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link SmtpServer}).
 */
Tenant.prototype.createSmtpServer = function createSmtpServer(/* server, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['server', 'options', 'callback']);
  this.dataStore.createResource('/smtpServers', args.options, args.server, require('./SmtpServer'), args.callback);
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

  return dataStore.getResource('/users?search=profile.emailVerificationToken+eq+%22' + token + '%22', function (err, users) {
    if (err) {
      return callback(err);
    }

    var user = users.items[0];

    if (!user) {
      var error = new Error('The requested resource does not exist.');
      error.status = error.code = 404;
      return callback(error);
    }

    if (user.profile.emailVerificationToken === token) {
      user.profile.emailVerificationToken = null;
      user.profile.emailVerificationStatus = 'VERIFIED';

      var href = '/users/' + user.id;

      user.href = href;

      dataStore.saveResource(user, function (err) {
        if (err) {
          return callback(err);
        }

        var activateUri = 'users/' + user.id + '/lifecycle/activate?sendEmail=false';

        dataStore.createResource(activateUri, function (err) {
          if (err) {
            return callback(err);
          }

          dataStore._evict(href, function (err) {
            if (err) {
              callback(err);
            } else {
              callback(err ? err : null, err ? null : {
                href: href
              });
            }
          });

        });
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

/**
 * Retrieves all the {@link IdSiteModel} resources for this resource.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link IdSiteModel} objects.
 *
 */
Tenant.prototype.getIdSites = function getTenantIdSites(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.idSites.href, args.options, require('./IdSiteModel'), args.callback);
};

/**
 * Retrieves all the {@link SmtpServer} resources for this resource.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link SmtpServer} objects.
 *
 */
Tenant.prototype.getSmtpServers = function getSmtpServers(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.smtpServers.href, args.options, require('./SmtpServer'), args.callback);
};

/**
 * Creates a link between two given accounts. If the two accounts are already
 * linked, this will error. The designations "left" and "right" are purely
 * arbitrary and imply no hierarchy or ordering between the accounts.
 *
 * @param {Account} leftAccount
 * One of the accounts to create a link between.
 *
 * @param {Account} rightAccount
 * Other one of the accounts to create a link between.
 *
 * @param {ExpansionOptions} [options]
 * Options to expand the returned {@link AccountLink} resource.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link AccountLink}).
 *
 * @example
 *
 * var leftAccount = {
 *  href: 'https://api.stormpath.com/v1/accounts/1oS9pRJ8we097h882rhWyb'
 * };
 *
 * var rightAccount = {
 *  href: 'https://api.stormpath.com/v1/accounts/xbohsiHoGq0qRGW4c0hqd'
 * };
 *
 * tenant.createAccountLink(leftAccount, rightAccount, function (err, accountLink) {
 *   if (!err) {
 *     console.log('Account Link Created', accountLink);
 *   }
 * });
 */
Tenant.prototype.createAccountLink = function createAccountLink(/* leftAccount, rightAccount, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['leftAccount', 'rightAccount', 'options', 'callback']);

  var accountLink = {
    leftAccount: {
      href: args.leftAccount.href
    },
    rightAccount: {
      href: args.rightAccount.href
    }
  };

  return this.dataStore.createResource('/accountLinks', args.options, accountLink, require('./AccountLink'), args.callback);
};

module.exports = Tenant;
