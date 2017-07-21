'use strict';

var Dot = require('dot-object');
var extend = require('xtend/mutable');
var _ = require('underscore');
var uuid = require('uuid');

var ApiKey = require('./ApiKey');
var CustomData = require('./CustomData');
var DirectoryChildResource = require('./DirectoryChildResource');
var FactorInstantiator = require('./FactorInstantiator');
var getFactorConstructor = FactorInstantiator.getConstructor;
var FactorInstanceCtor = FactorInstantiator.Constructor;
var utils = require('../utils');

/**
 * Transforms the output of Dot().object().  By default that library will convert arrays like so:
 *
 * ['val', 'val2']
 *
 * becomes..
 *
 * {
 *   'array.0': 'val',
 *   'array.1': 'val2'
 * }
 *
 * But we want to preserve arrays, so this function un-does the above.
 */
function dotObjectArrayTransform(obj) {
  var r = /(.+)_([0-9])+$/;
  Object.keys(obj).forEach(function (key) {
    var val = obj[key];
    var match = key.match(r);

    if (key.match(/stormpathApiKey_/)) {
      return;
    }

    if (val && typeof val === 'object') {
      obj[key] = dotObjectArrayTransform(val);
    } else if (match) {
      var arrayKey = match[1];
      if (!obj[arrayKey]) {
        obj[arrayKey] = [];
      }
      obj[arrayKey].push(val);
      delete obj[key];
    }
  });
  return obj;
}

/**
 * @class Account
 *
 * @description
 *
 * Encapsulates a Account resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Account](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#account).
 *
 * For more information about managing your accounts with Stormpath, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt Account Management}.
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Application#getAccount Application.getAccount()}
 * - {@link Application#getAccounts Application.getAccounts()}
 * - {@link Client#getAccount Client.getAccount()}
 * - {@link Directory#getAccounts Directory.getAccounts()}
 * - {@link Group#getAccounts Group.getAccounts()}
 * - {@link Organization#getAccounts Organization.getAccounts()}
 * - {@link Phone#getAccount Phone.getAccount()}
 * - {@link Factor#getAccount Factor.getAccount()}
 *
 * @augments {DirectoryChildResource}
 *
 * @augments {InstanceResource}
 *
 * @param {Object} accountResource
 *
 * The JSON representation of this resource.
 */
function Account(data) {
  Account.super_.apply(this, arguments);

  Object.defineProperty(this, '_isNew', {value: !!data._isNew, configurable: true});

}
utils.inherits(Account, DirectoryChildResource);

/**
 * @typedef {Object} AccountData
 *
 * @description
 *
 * This object represents that data that can be provided when creating a new
 * account with one of these methods:
 *
 * - {@link Application#createAccount Application.createAccount()}
 * - {@link Directory#createAccount Directory.createAccount()}
 * - {@link Organization#createAccount Organization.createAccount()}
 *f
 * @property {Object} [customData={}]
 * Custom key/value data that you wish to store in this account's custom data
 * resource.
 *
 * @property {String} email
 * User's email address.
 *
 * @property {String} givenName
 * User's first name.
 *
 * @property {String} [middleName]
 * User's middle name.
 *
 * @property {String} password
 * User's desired password, must meet password strength requirements of the
 * default account store.
 *
 * @property {String} surname
 * User's last name.
 *
 * @property {String} [status=UNVERIFIED|ENABLED]
 * Sets the status flag of the account, one of `ENABLED`, `DISABLED`,
 * `UNVERIFIED`. If not specified, will default to `UNVERIFIED` if email
 * verification is enabled on the default account store. Otherwise the default
 * is `ENABLED`.
 *
 * @property {String} [username]
 * User's desired username.
 */

/**
 * Retrieves the collection of access tokens that have been issued to this
 * account.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link AccessToken} objects.
 */
Account.prototype.getAccessTokens = function getAccessTokens(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accessTokens.href, args.options, require('./AccessToken'), args.callback);
};

/**
 * Retrieves the collection of refresh tokens that have been issued to this
 * account.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link RefreshToken} objects.
 */
Account.prototype.getRefreshTokens = function getRefreshTokens(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.refreshTokens.href, args.options, require('./RefreshToken'), args.callback);
};

/**
 * Retrieves the collection of groups that this account is a member of.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `name`, `description`, `status`, `createdAt`, `modifiedAt`.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Group} objects.
 */
Account.prototype.getGroups = function getAccountGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  var Group = require('./Group');
  return this.dataStore.getResource(this.href + '/groups', args.options, Group, Group.prototype.oktaGroupCollectionFilter.bind(null, args.callback));
};

/**
 * Retrieves the collection of group memberships for this account. Group
 * memberships are a resource that represent the link between an account and
 * group.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link GroupMembership} objects.
 */
Account.prototype.getGroupMemberships = function getGroupMemberships(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groupMemberships.href, args.options, require('./GroupMembership'), args.callback);
};

/**
 * Adds the account to the given group.
 *
 * @param {Object|String} group
 * If this parameter is a string, it should be the HREF of the group that the
 * account will be added to.
 *
 * If it is an object, it should have an href property which is the group href.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link GroupMembership}).
 *
 * @example
 *
 * var groupHref = 'https://api.stormpath.com/v1/groups/xxx';
 * account.addToGroup(groupHref, callbackFn);
 *
 * @example
 *
 * var group = {
 *   href: 'https://api.stormpath.com/v1/groups/xxx';
 * };
 *
 * account.addToGroup(group, callbackFn);
 *
 * @example
 *
 * var groupHref = 'https://api.stormpath.com/v1/groups/xxx';
 * client.getGroup(groupHref, function(err, group) {
 *   account.addToGroup(group, callbackFn);
 * });
 */
Account.prototype.addToGroup = function addAccountToGroup(/* groupOrGroupHref, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback'], true);

  if (typeof args.group === 'string') {
    args.group = {
      href: args.group
    };
  }

  return this._createGroupMembership(this, args.group, args.options, args.callback);
};

/**
 * Get the account's provider data resource. The provider data resource
 * contains information about this account's link to a third-party provider,
 * such as Google.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link ProviderData}).
 */
Account.prototype.getProviderData = function getProviderData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.providerData) {
    return args.callback();
  }

  return this.dataStore.getResource(this.providerData.href, args.options, require('./ProviderData'), args.callback);
};

/**
 * Creates an {@link ApiKey} for this account, which can be used to
 * authenticate a request to your service. For more information please read
 * {@link http://docs.stormpath.com/guides/api-key-management/ Using Stormpath for API Authentication}.
 *
 * @param  {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link ApiKey}).
 */
Account.prototype.createApiKey = function createApiKey(options, callback) {
  var cb = typeof options === 'function' ? options : callback;

  var apiKeyCount = Object.keys(this.profile).filter(function (key) {
    return key.match(/stormpathApiKey_[0-9]+/);
  }).length;

  var nextKey = 'stormpathApiKey_' + (apiKeyCount + 1);
  var id = uuid.v4();
  var secret = uuid.v4();

  this.customData[nextKey] = id + ':' + secret;

  return this.save(function (err) {
    if (err) {
      return cb(err);
    }
    cb(null, new ApiKey({
      id: id,
      secret: secret
    }));
  });
};

/**
* Create a {@link SmsFactor} or {@link GoogleAuthenticatorFactor} for this account,
* which can be challenged for multi-factor authentication.  For more information on
* this feature, please read [Using Multi-Factor Authentication](https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#using-multi-factor-authentication).
*
* @param {Object} factor
* An object literal that describes the factor to create, the type must be
* specified.  If this is an SMS factor, you can optionally describe the challenge,
* which will be automatically created and sent to the phone number.
*
* @param {Object} [factor.challenge]
* An object literal that describes the {@link Challenge} object to automatically
* create.
*
* @param {String} factor.challenge.message
* The message for the challenge, which must include the placeholder `${code}`.
*
* @param {Object} [factor.phone]
* For SMS factors, an object literal that describes the {@link Phone} resource
* that will be created.
*
* @param {String} factor.phone.number
* The phone number to send challenge codes to.
*
* @param {String} factor.type
* Must be `sms` or `google-authenticator`.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with the
* parameters (err, {@link SmsFactor}) or (err, {@link GoogleAuthenticatorFactor}),
* depending on the specified type.
*
* @example <caption>Creating an SMS Factor.</caption>
* var factor = {
*   type: 'sms',
*   phone: {
*     number: '+14151231234'
*   }
* };
*
* account.createFactor(factor, function(err, smsFactor) {
*   if (err) {
*     return console.log(err);
*   }
*
*   console.log(smsFactor);
* });
*
* @example <caption>Creating a Google Authenticator factor.</caption>
* var factor = {
*   type: 'google-authenticator'
* };
*
* account.createFactor(factor, function(err, googleAuthenticatorFactor) {
*   if (err) {
*     return console.log(err);
*   }
*
*   console.log(googleAuthenticatorFactor);
* });
*/
Account.prototype.createFactor = function createFactor(/* factor, callback */) {
  var args = utils.resolveArgs(arguments, ['factor', 'options', 'callback']);
  var FactorCtor = getFactorConstructor.call(this, args.factor);

  return this.dataStore.createResource(this.factors.href, args.options, args.factor, FactorCtor, args.callback);
};

/**
* Retrieves a list of factors for this account.
*
* @param {CollectionQueryOptions} collectionQueryOptions
* Options for querying, paginating, and expanding the collection. This collection
* supports filter on the `type` field.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called
* with the parameters (err, {@link CollectionResource}). The collection will
* be a list of {@link SmsFactor} and {@link GoogleAuthenticatorFactor} objects,
* automatically instantiated to their correct type.
*/
Account.prototype.getFactors = function getAccountFactors(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.factors.href, args.options, FactorInstanceCtor, args.callback);
};

/**
* Retrieves a list of phone entries belonging to this account.
*
* @param {CollectionQueryOptions} collectionQueryOptions
* Additional query options for querying, filtering, sorting and paginating the {@link Phone}
* collection. It can be filtered via the `number`, `status`, `verificationStatus`, `name`,
* and `description` fields.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called
* with the parameters (err, {@link CollectionResource}). The collection will be
* a list of {@link Phone} objects.
*/
Account.prototype.getPhones = function getAccountPhones(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.phones.href, args.options, require('./Phone'), args.callback);
};

/**
 * Retrieves a collection of the account's API Keys.
 *
 * The `secret` property of each resource is encrypted with the tenant API Key
 * Secret that was used to configure the current {@link Client} instance. We do
 * this to ensure that the secret is encrypted at rest, as it may be cached in
 * your caching database.
 *
 * Password-based AES 256 encryption is used. The PBKDF2 implementation will use
 * 1024 iterations by default to derive the AES 256 key.
 *
 * At the risk of potentially decreased security, you can use the
 * `encryptionKeySize` option to specify a smaller encryption key size. You can
 * also request a lower number of key iterations with the `encryptionKeyIterations`
 * option. This can reduce the CPU time required to decrypt the key after transit
 * or when retrieving from cache. It is not recommended to go much lower than
 * 1024 (if at all) in security sensitive environments.
 *
 * @param {CollectionQueryOptions} options
 * Options for querying, paginating, and expanding the collection. This collection does not
 * support filter searches. The following options can also be used with this
 * request:
 *
 * @param {String} [options.id=null]
 * Search for a specific key by key id.
 *
 * @param {Number} [options.encryptionKeySize=256]
 * Set to 128 or 192 to change the AES key encryption size.
 *
 * @param {Number} [options.encryptionKeyIterations=1024]
 * Number of encryption iterations.
 */
Account.prototype.getApiKeys = function getApiKeys(options, callback) {
  var cb = typeof options === 'function' ? options : callback;
  var opts = _.extend({}, this.dataStore.apiKeyEncryptionOptions, typeof options === 'object' ? options : {});

  return this.dataStore.getResource(this.apiKeys.href, opts, require('./ApiKey'), cb);
};

/**
 * Retrieves the collection of accounts that this account is linked to.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `createdAt`, `email`, `givenName`, `middleName`, `modifiedAt`, `surname`,
 * `status`, `username`.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Account} objects.
 */
Account.prototype.getLinkedAccounts = function getLinkedAccounts(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.linkedAccounts.href, args.options, Account, args.callback);
};

/**
* Retrieves the collection of account links that are associated with the current
* account.
*
* @param {CollectionQueryOptions} CollectionQueryOptions
* Options for querying, paginating and expanding the collection. This collection
* does not support filter searches, but it does support attribute searches by
* `createdAt`. It allows expansion of the `leftAccount` and `rightAccount` attributes.
*
* @param {Function} callback
* The function to call when the operation is complete. Will be called with
* the parameters (err, {@link CollectionResource}). The collection will be a
* list of {@link AccountLink} objects.
*/
Account.prototype.getAccountLinks = function getAccountLinks(/* [options], callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.accountLinks.href, args.options, require('./AccountLink'), args.callback);
};

/**
 * Creates a link between this account and a given account. If the two accounts
 * are already linked, this will error.
 *
 * @param {Account} linkedAccount Account to link this account to.
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
 * var otherAccount = {
 *   href: 'https://api.stormpath.com/v1/accounts/1oS9pRJ8we097h882rhWyb'
 * };
 *
 * account.createAccountLink(otherAccount, function (err, accountLink) {
 *   if (!err) {
 *     console.log('Account Link Created', accountLink);
 *   }
 * });
 */
Account.prototype.createAccountLink = function linkToAccount(/* linkedAccount, callback */) {
  var args = utils.resolveArgs(arguments, ['linkedAccount', 'options', 'callback']);
  var accountLink = {
    leftAccount: {
      href: this.href
    },
    rightAccount: {
      href: args.linkedAccount.href
    }
  };

  return this.dataStore.createResource('/accountLinks', args.options, accountLink, require('./AccountLink'), args.callback);
};

/**
 * Save changes to this account.
 *
 * @param  {Function} callback
 * The function to call when the save operation is complete. Will be called
 * with the parameters (err,updatedAccount).
 */
Account.prototype.save = function saveAccount() {
  var self = this;

  var args = Array.prototype.slice.call(arguments);

  // If customData, then inject our own callback and invalidate the
  // customData resource cache when the account finishes saving.
  if (self.customData) {
    var lastArg = args.length > 0 ? args[args.length - 1] : null;
    var originalCallback = typeof lastArg === 'function' ? args.pop() : function nop() {};

    args.push(function newCallback(err) {
      var newCallbackArgs = arguments;

      if (err) {
        return originalCallback(err);
      }

      self.dataStore._evict(self.customData.href, function(err) {
        if (err) {
          return originalCallback(err);
        }

        originalCallback.apply(null, newCallbackArgs);
      });
    });
  }

  Account.super_.prototype.save.apply(self, args);
};


/**
 * Converts this account instance to an Okta user schema.  This is a best-effort
 * attempt and may not fit all use cases.  Use this as a potential solution to unblock
 * your migration efforts, but we recommend refactoring your code to work against
 * the Okta user schema.
 *
 * @return {Account} Stormpath account.
 */

Account.prototype.transformOktaUser = function transformOktaUser() {

  var account = this;

  /**
   * A map of Okta User statuses to Stormpath Account statuses.
   * @type {Object}
   */
  var statusMap = {
    'ACTIVE': 'ENABLED',
    'DEPROVISIONED': 'DISABLED',
    'LOCKED_OUT': 'DISABLED',
    'PASSWORD_EXPIRED': 'DISABLED',
    'PROVISIONED': 'UNVERIFIED',
    'RECOVERY': 'ENABLED',
    'STAGED': 'UNVERIFIED',
    'SUSPENDED': 'DISABLED'
  };

  /**
   * A map of Okta User Profile properties that can be mapped onto core Stormpath
   * Account properties
   * @type {Object}
   */
  var oktaProfileMap = {
    login: 'username',
    email: 'email',
    firstName: 'givenName',
    middleName: 'middleName',
    lastName: 'surname',
    emailVerificationStatus: 'emailVerificationStatus'
  };

  var userProfile = account.profile;

  // The latter is true when the user is pulled from a collection that was queried
  var selfLink = account._links.self || account._links.user;
  // Fallback to manually constructed relative href if an absolute one cannot be found
  var href = selfLink && selfLink.href || 'users/' + account.id;

  extend(account, {
    href: href,
    fullName: userProfile.firstName + ' ' + userProfile.lastName,
    status: statusMap[account.status] || 'UNKNOWN',
    createdAt: account.created,
    modifiedAt: account.lastUpdated,
    passwordModifiedAt: account.passwordChanged,
    emailVerificationToken: null,
    customData: new CustomData({
      href: account.href + '/customData'
    }, account.dataStore, account)
  });

  Object.keys(account.profile).reduce(function (account, key) {

    var value = account.profile[key];

    if (oktaProfileMap[key]) {
      account[oktaProfileMap[key]] = account.profile[key];
    } else if (key === 'customData') {
      try {
        account.customData = new CustomData(JSON.parse(value), account.dataStore, account);
      } catch (e) {
        console.error('Could not parse custom data for user ' + account.href);
      }
    } else if (key === 'emailVerificationToken') {
      account.emailVerificationToken = {
        href: '/' + value
      };
      delete account.profile.emailVerificationToken; // so that the end user can't read it through the /me endpoint
    } else {
      var obj = [];
      obj[key] = value;
      extend(account.customData, new Dot('_').object(obj));
    }
    return account;
  }, account);
};

Account.prototype.toOktaUser = function toOktaUser(configuration) {

  if (configuration && typeof configuration !== 'object') {
    throw new Error('.toOktaUser(configuration) configuration must be an object');
  }

  configuration = configuration || {};

  var account = this;
  var oktaPropertyMap = {
    givenName: 'firstName',
    middleName: 'middleName',
    surname: 'lastName'
  };

  var oktaUser = {
    profile: {

    },
    credentials: {
      password: {
        value: ''
      }
    }
  };

  return Object.keys(account).reduce(function functionName(oktaUser, key) {
    var value = account[key];
    switch (key) {
      case 'email':
        oktaUser.profile.login = oktaUser.profile.email = value;
        break;
      case 'password':
        oktaUser.credentials.password.value = value;
        break;
      case 'customData':
        if (configuration.customDataStrategy === 'serialize') {
          oktaUser.profile.customData = JSON.stringify(value);
        } else {
          extend(oktaUser.profile, dotObjectArrayTransform(new Dot('_').dot(value)));
        }
        break;
      default:
        var p = oktaPropertyMap[key];
        if (p) {
          oktaUser.profile[p] = value;
        }

        break;
    }

    return oktaUser;

  }, oktaUser);
};

module.exports = Account;
