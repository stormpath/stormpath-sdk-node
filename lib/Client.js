'use strict';

var async = require('async'),
  events = require('events'),
  util = require('util'),
  Config = require('./Config'),
  DataStore = require('./ds/DataStore'),
  Tenant = require('./resource/Tenant');

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
    return err ? self.emit('error', err): self.emit('ready');
  });
}

// By inheriting from `events.EventEmitter`, we're making our Client object a
// true EventEmitter -- allowing us to fire off events.
util.inherits(Client, Object);
util.inherits(Client, events.EventEmitter);

Client.prototype.mergeRemoteConfig = function(callback) {
  var self = this;
  var config = self.config;
  var application = config.application;

  function findApplication(name, cb) {
    self.getApplications({ name: application.name }, function(err, applications) {
      if (err) {
        return cb(err);
      }

      applications.detect(function(app, cb) {
        cb(application.name === app.name);
      }, function(app) {
        if (app) {
          self.config.application.href = app.href;
          return cb(null, app);
        }

        return cb(new Error('Application not found: "' + application.name + '"'));
      });
    });
  }

  function findDefaultDirectoryHref(application, cb) {
    application.getAccountStoreMappings(function(err, mappings) {
      if (err) {
        return cb(err);
      }
      mappings.detect(function(mapping,cb){
        cb(mapping.isDefaultAccountStore);
      },function(defaultMapping){
        if(defaultMapping){
          var href = defaultMapping.accountStore.href;
          if(href.match(/group/)){
            self.getGroup(href,function(err,group){
              cb(err,group &&group.directory.href);
            });
          }else{
            cb(null,href);
          }
        }else{
          cb(null,null);
        }
      });
    });
  }

  function applyConfig(directoryHref, cb) {
    if(!directoryHref){
      callback(null);
    }else{
      self.getDirectory(
        directoryHref,
        {expand:'passwordPolicy,accountCreationPolicy'},
        function(err,directory){
          if(err){
            cb(err);
          }else{
            self.config.web.verifyEmail.enabled =
              directory.accountCreationPolicy.verificationEmailStatus === 'ENABLED';
            self.config.web.changePassword.enabled = self.config.web.forgotPassword.enabled =
              directory.passwordPolicy.resetEmailStatus === 'ENABLED';
            cb(null);
          }
        }
      );
    }
  }

  if (application && application.href) {
    async.waterfall([
      self.getApplication.bind(self, application.href),
      findDefaultDirectoryHref,
      applyConfig
    ], callback);
  } else if (application && application.name) {
    async.waterfall([
      findApplication(application.name),
      findDefaultDirectoryHref,
      applyConfig
    ], callback);
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
 * @method getCurrentTenant
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
 * @callback getResourceCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The retrieved resource object.
 */

/**
 * Retrieves a resource object by href.
 *
 * @method getResource
 * @param {String} href - The URI of the resource.
 * @param {Object} [query] - Name / value pairs to use as query parameters.
 * @param {Function} [constructor] - The constructor function that will be
 *  invoked when the given resource is retrieved.  EG: Account, Directory,
 *  Group, etc.  Defaults to `InstanceResource`.  If a resource returned from
 *  the API is a collection (not a single resource object), then each returned
 *  object in the `items` array will be passed into this constructor function
 *  and initialized.
 * @param {getResourceCallback} callback - The callback that handles the
 *  resposne.
 */
Client.prototype.getResource = function() {
  return this._dataStore.getResource.apply(this._dataStore, arguments);
};

/**
 * @callback createResourceCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The created resource object.
 */

/**
 * Creates a new resource object as a child of the specified parentHref
 * location.  parentHref must be a collection resource endpoint.  This is a
 * utility method we use internally to handle resource creation.
 *
 * @method createResource
 * @param {String} parentHref - The URI of the parent's collection resource.
 * @param {Object} [query] - Name / value pairs to use as query parameters.
 * @param {Function} [constructor] - The constructor function that will be
 *  invoked when the given resource is retrieved.  EG: Account, Directory,
 *  Group, etc.  Defaults to `InstanceResource`.  If a resource returned from
 *  the API is a collection (not a single resource object), then each returned
 *  object in the `items` array will be passed into this constructor function
 *  and initialized.
 * @param {createResourceCallback} callback - The callback that handles the
 *  resposne.
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
 * @method
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
 * @method createApplication
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
 * @callback getAccountsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directories - The retrieved Account objects.
 */

/**
 * Retrieves all Account objects.
 *
 * @method
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
 * @method
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
 * @method
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
 * @method createDirectory
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
 * @callback getAccountCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} account - The retrieved Account object.
 */

/**
 * Retrieves an Account object.
 *
 * @method
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
 * @method
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
 * @method
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
 * @method
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

Client.prototype.getGroupMembership = function getClientGroupMembership(/* href, [options,], callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.getResource(href, options, require('./resource/GroupMembership'), callback);
};

module.exports = Client;
