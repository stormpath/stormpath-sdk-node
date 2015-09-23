'use strict';

var events = require('events');
var util = require('util');

var async = require('async');
var deepExtend = require('deep-extend');

var Config = require('./Config');
var DataStore = require('./ds/DataStore');
var Directory = require('./resource/Directory');
var Tenant = require('./resource/Tenant');

/**
 * Creates a new Client.
 *
 * @class
 */
function Client(config) {
  var self = this;

  // Call the constructor of the EventEmitter class -- this, allows us to
  // initialize our Client object as an EventEmitter, and allows us to fire off
  // events later on.
  events.EventEmitter.call(self);

  // Bind the user-supplied config property to our class so it can be accessed
  // like an object.
  self.config = new Config(config);

  // For backwards compatibility reasons, if no API key is specified we'll try
  // to grab the API credentials out of our new format and shove it into the old
  // format.  This can go away once we cut a release and decide to no longer
  // support the old configuration formatting.
  if (!self.config.apiKey) {
    self.config.apiKey = self.config.client.apiKey;
  }

  self._dataStore = new DataStore(self.config);

  // We'll maintain this class variable as an in-memory singleton for caching
  // purposes.  We do this because Tenants never ever change once a Client has
  // been initialized, so it makes sense to cache the Tenant object so we don't
  // make unnecessary API requests if this object is looked up more than once.
  self._currentTenant = null;

  self.mergeRemoteConfig(function(err) {
    return err ? self.emit('error', err): self.emit('ready', self);
  });
}

// By inheriting from `events.EventEmitter`, we're making our Client object a
// true EventEmitter -- allowing us to fire off events.
util.inherits(Client, Object);
util.inherits(Client, events.EventEmitter);

/**
 * @private
 * @callback mergeRemoteConfigCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The retrieved resource object.
 */

/**
 * Retrieves Stormpath settings from the API service, and ensures the local
 * configuration object properly reflects these settings.
 *
 * @private
 * @param {mergeRemoteConfigCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.mergeRemoteConfig = function(callback) {
  var self = this;
  var config = self.config;
  var applicationConfig = config.application;

  // Returns the OAuth policy of the Stormpath Application.
  function applyOauthPolicy(app, cb){
    app.getOAuthPolicy(function(err, policy) {
      if (err) {
        return cb(err);
      }

      app.oAuthPolicy = policy;
      self.config.application = app;

      return cb(null, app);
    });
  }

  // Finds and returns an Application object given an Application name.  Will
  // return an Error if no Application can be found.
  function findApplication(name, cb) {
    self.getApplications({ name: name }, function(err, applications) {
      if (err) {
        return cb(err);
      }

      applications.detect(function(app, cb) {
        cb(name === app.name);
      }, function(app) {
        if (app) {
          applyOauthPolicy(app, cb);
        }
        return cb(new Error('Application not found: "' + name + '"'));
      });
    });
  }

  // Iterate over all account stores on the given Application, looking for all
  // Social providers.  We'll then create a config.providers array which we'll
  // use later on to dynamically populate all social login configurations ^^
  function setProviders(application, cb) {
    application.getAccountStoreMappings(function(err, mappings) {
      if (err) {
        return cb(err);
      }

      mappings.each(function(mapping, next) {
        mapping.getAccountStore(function(err, accountStore) {
          if (err) {
            return next(err);
          }

          if (accountStore instanceof Directory) {
            accountStore.getProvider(function(err, provider) {
              if (err) {
                return next(err);
              }
              // As long as the provider isn't Stormpath, or AD/LDAP, it must be
              // a social directory!
              if (provider.providerId !== 'stormpath' && provider.providerId !== 'ad' && provider.providerId !== 'ldap') {

                // Remove unnecessary properties that will clutter our config!
                delete provider.href;
                delete provider.createdAt;
                delete provider.updatedAt;

                deepExtend(self.config.socialProviders[provider.providerId], provider, { enabled: true });
              }
              next();
            });
          } else {
            next();
          }
        });
      }, function(err) {
        cb(err, application);
      });
    });
  }

  // Finds and returns an Application's default Account Store (Directory)
  // object.  If one doesn't exist, nothing will be returned.
  function findDefaultDirectoryHref(application, cb) {
    application.getAccountStoreMappings(function(err, mappings) {
      if (err) {
        return cb(err);
      }

      mappings.detect(function(mapping, cb) {
        cb(mapping.isDefaultAccountStore);
      }, function(defaultMapping) {
        if (defaultMapping) {
          var href = defaultMapping.accountStore.href;

          if (href.match(/directories/)) {
            return cb(null, href);
          }
          if (href.match(/group/)) {
            self.getGroup(href, function(err, group) {
              return cb(err, group && group.directory.href);
            });
          } else {
            return cb(null,null);
          }
        } else {
          return cb(null,null);
        }
      });
    });
  }

  // Pulls down all of a Directory's configuration settings, and applies them to
  // the local configuration.
  function applyConfig(directoryHref, cb) {
    if (!directoryHref) {
      return cb();
    }

    self.getDirectory(directoryHref, { expand: 'passwordPolicy,accountCreationPolicy' }, function(err, directory) {
      if (err) {
        return cb(err);
      }

      directory.getPasswordPolicy(function(err, policy) {
        if (err) {
          throw err;
        }

        policy.getStrength(function(err, strength) {
          if (err) {
            return cb(err);
          }

          // Remove the href property from the Strength Resource, we don't want
          // this to clutter up our nice passwordPolicy configuration
          // dictionary!
          delete strength.href;

          self.config.passwordPolicy = strength;
        });
      });

      self.config.web.forgotPassword.enabled = directory.passwordPolicy.resetEmailStatus === 'ENABLED';
      self.config.web.changePassword.enabled = directory.passwordPolicy.resetEmailStatus === 'ENABLED';
      self.config.web.verifyEmail.enabled = directory.accountCreationPolicy.verificationEmailStatus === 'ENABLED';
      self.config.web.changePassword.enabled = self.config.web.forgotPassword.enabled = directory.passwordPolicy.resetEmailStatus === 'ENABLED';

      return cb();
    });
  }

  // If the `application.href` configuration property exists, we'll attempt to
  // grab the Application object directly.
  if (applicationConfig && applicationConfig.href) {
    async.waterfall([
      self.getApplication.bind(self, applicationConfig.href),
      applyOauthPolicy,
      setProviders,
      findDefaultDirectoryHref,
      applyConfig
    ], callback);

  // If the `application.name` configuration property exists, we'll attempt to
  // grab the Application object by name.
  } else if (applicationConfig && applicationConfig.name) {
    async.waterfall([
      findApplication(applicationConfig.name),
      setProviders,
      findDefaultDirectoryHref,
      applyConfig
    ], callback);

  // If none `application` properties exist, we'll do nothing and just continue
  // onwards.
  } else {
    process.nextTick(callback);
  }
};

/**
 * @callback getCurrentTenantCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} tenant - The retrieved Tenant object.
 */

/**
 * Retrieves the current Tenant object.
 *
 * @param {Object} [options] - Options.
 * @param {getCurrentTenantCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getCurrentTenant = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  // First, we'll check to see if we've already cached the current tenant (since
  // a Tenant never changes once a Client has been initialized).  This prevents
  // us from making unnecessary repeat API requests if this method is called
  // multiple times.
  if (self._currentTenant) {
    return callback(null, self._currentTenant);
  }

  self._dataStore.getResource('/tenants/current', options, Tenant, function(err, tenant) {
    if (err) {
      return callback(err);
    }

    self._currentTenant = tenant;
    return callback(null, tenant);
  });
};

/**
 * @private
 * @callback getResourceCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The retrieved resource object.
 */

/**
 * Retrieves a resource object by href.
 *
 * @private
 * @param {String} href - The URI of the resource.
 * @param {Object} [query] - Name / value pairs to use as query parameters.
 * @param {Function} [constructor] - The constructor function that will be
 *  invoked when the given resource is retrieved.  EG: Account, Directory,
 *  Group, etc.  Defaults to `InstanceResource`.  If a resource returned from
 *  the API is a collection (not a single resource object), then each returned
 *  object in the `items` array will be passed into this constructor function
 *  and initialized.
 * @param {getResourceCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getResource = function() {
  return this._dataStore.getResource.apply(this._dataStore, arguments);
};

/**
 * @private
 * @callback createResourceCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The created resource object.
 */

/**
 * Creates a new resource object as a child of the specified parentHref
 * location.  parentHref must be a collection resource endpoint.  This is a
 * utility method we use internally to handle resource creation.
 *
 * @private
 * @param {String} parentHref - The URI of the parent's collection resource.
 * @param {Object} [query] - Name / value pairs to use as query parameters.
 * @param {Function} [constructor] - The constructor function that will be
 *  invoked when the given resource is retrieved.  EG: Account, Directory,
 *  Group, etc.  Defaults to `InstanceResource`.  If a resource returned from
 *  the API is a collection (not a single resource object), then each returned
 *  object in the `items` array will be passed into this constructor function
 *  and initialized.
 * @param {createResourceCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.createResource = function() {
  this._dataStore.createResource.apply(this._dataStore, arguments);
};

/**
 * @callback getApplicationsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} applications - The retrieved Application objects.
 */

/**
 * Retrieves all Application objects.
 *
 * @param {Object} [options] - Options.
 * @param {getApplicationsCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getApplications = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    return tenant.getApplications(options, callback);
  });
};

/**
 * @callback createApplicationCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} application - The created Application object.
 */

/**
 * Creates a new Application object.
 *
 * @param {Object} application - The Application object to create.
 * @param {Object} [options] - Options.
 * @param {createApplicationCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.createApplication = function() {
  var args = Array.prototype.slice.call(arguments);
  var app = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    return tenant.createApplication(app, options, callback);
  });
};

/**
 * @callback createApplicationsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object[]} applications - An array of created Application objects.
 */

/**
 * Creates multiple new Application objects.
 *
 * @param {Object[]} applications - An array of Application objects to create.
 * @param {Object} [options] - Options.
 * @param {createApplicationsCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.createApplications = function() {
  var args = Array.prototype.slice.call(arguments);
  var apps = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    async.map(apps, function(app, cb) {
      return tenant.createApplication(app, options, cb);
    }, function(err, applications) {
      return callback(err, applications);
    });
  });
};

/**
 * @callback getAccountsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directories - The retrieved Account objects.
 */

/**
 * Retrieves all Account objects.
 *
 * @param {Object} [options] - Options.
 * @param {getAccountsCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getAccounts = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    return tenant.getAccounts(options, callback);
  });
};

/**
 * @callback getGroupsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} groups - The retrieved Group objects.
 */

/**
 * Retrieves all Group objects.
 *
 * @param {Object} [options] - Options.
 * @param {getGroupsCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getGroups = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    return tenant.getGroups(options, callback);
  });
};

/**
 * @callback getDirectoriesCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directories - The retrieved Directory objects.
 */

/**
 * Retrieves all Directory objects.
 *
 * @param {Object} [options] - Options.
 * @param {getDirectoriesCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getDirectories = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    return tenant.getDirectories(options, callback);
  });
};

/**
 * @callback createDirectoryCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directory - The created Directory object.
 */

/**
 * Creates a new Directory object.
 *
 * @param {Object} directory - The Directory object to create.
 * @param {Object} [options] - Options.
 * @param {createDirectoryCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.createDirectory = function() {
  var args = Array.prototype.slice.call(arguments);
  var dir = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    return tenant.createDirectory(dir, options, callback);
  });
};

/**
 * @callback createDirectoriesCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object[]} directories - An array of created Directory objects.
 */

/**
 * Creates multiple new Directory objects.
 *
 * @param {Object[]} directories - An array of Directory objects to create.
 * @param {Object} [options] - Options.
 * @param {createDirectoriesCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.createDirectories = function() {
  var args = Array.prototype.slice.call(arguments);
  var dirs = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    async.map(dirs, function(dir, cb) {
      return tenant.createDirectory(dir, options, cb);
    }, function(err, directories) {
      return callback(err, directories);
    });
  });
};

/**
 * Creates a new Organization object.
 *
 * @param {Object} organization - The Organization object to create.
 * @param {Object} [options] - Options.
 * @param {createOrganizationCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.createOrganization = function createOrganization() {
  var args = Array.prototype.slice.call(arguments);
  var data = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return callback(err);
    }

    return tenant.createOrganization(data, options, callback);
  });
};

/**
 * @callback getAccountCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} account - The retrieved Account object.
 */

/**
 * Retrieves an Account object.
 *
 * @param {String} href - The Account href.
 * @param {Object} [options] - Options.
 * @param {getAccountCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getAccount = function() {
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.getResource(href, options, require('./resource/Account'), callback);
};

/**
 * @callback getApplicationCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} application - The retrieved Application object.
 */

/**
 * Retrieves an Application object.
 *
 * @param {String} href - The Application href.
 * @param {Object} [options] - Options.
 * @param {getAccountCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getApplication = function() {
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.getResource(href, options, require('./resource/Application'), callback);
};

/**
 * @callback getDirectoryCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directory - The retrieved Directory object.
 */

/**
 * Retrieves a Directory object.
 *
 * @param {String} href - The Directory href.
 * @param {Object} [options] - Options.
 * @param {getDirectoryCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getDirectory = function() {
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.getResource(href, options, require('./resource/Directory'), callback);
};

/**
 * @callback getGroupCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} group - The retrieved Group object.
 */

/**
 * Retrieves a Group object.
 *
 * @param {String} href - The Group href.
 * @param {Object} [options] - Options.
 * @param {getGroupCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getGroup = function() {
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.getResource(href, options, require('./resource/Group'), callback);
};

/**
 * @callback getGroupMembershipCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} groupMembership - The retrieved GroupMembership object.
 */

/**
 * Retrieves a GroupMembership object.
 *
 * @param {String} href - The GroupMembership href.
 * @param {Object} [options] - Options.
 * @param {getGroupMembershipCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getGroupMembership = function() {
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.getResource(href, options, require('./resource/GroupMembership'), callback);
};

Client.prototype.getOrganization = function getOrganization() {
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.getResource(href, options, require('./resource/Organization'), callback);
};

Client.prototype.getOrganizations = function getOrganizations(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;
  return self.getCurrentTenant(function onGetCurrentTenantForGroups(err, tenant) {
    if (err) {
      return callback(err, null);
    }
    return tenant.getOrganizations(options, callback);
  });
};

module.exports = Client;
