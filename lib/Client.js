'use strict';

var _ = require('lodash');
var util = require('util');
var async = require('async');
var events = require('events');

var stormpathConfig = require('stormpath-config');

var DataStore = require('./ds/DataStore');
var ObjectCallProxy = require('./proxy/ObjectCallProxy');

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

  // We'll maintain this class variable as an in-memory singleton for caching
  // purposes.  We do this because Tenants never ever change once a Client has
  // been initialized, so it makes sense to cache the Tenant object so we don't
  // make unnecessary API requests if this object is looked up more than once.
  self._currentTenant = null;

  // Indicates whether or not this client is ready yet.
  self._isReady = false;

  // Setup how we load our configuration.
  var configLoader = null;

  // If the config is a config loader, then use that.
  if (config instanceof stormpathConfig.Loader) {
    configLoader = config;
  // Just use our default client config loader.
  } else {
    configLoader = require('./configLoader')(config);
  }

  // Setup our call proxy.
  var awaitReadyProxy = new ObjectCallProxy(self);

  // Attach our proxy so that all calls to our client is
  // intercepted and queued until the client is ready.
  awaitReadyProxy.attach(function (name) {
    // Only proxy methods that start with either 'get' or 'create'.
    return name.indexOf('get') === 0 || name.indexOf('create') === 0;
  });

  // Load our configuration.
  process.nextTick(function () {
    configLoader.load(function (err, loadedConfig) {
      if (err) {
        self.emit('error', err);
        awaitReadyProxy.detach(new Error('Stormpath client initialization failed. See error log for more details.'));
      } else {
        self.config = loadedConfig;
        self._dataStore = new DataStore(loadedConfig);
        self._isReady = true;
        awaitReadyProxy.detach();
        self.emit('ready', self);
      }
    });
  });
}

// By inheriting from `events.EventEmitter`, we're making our Client object a
// true EventEmitter -- allowing us to fire off events.
util.inherits(Client, Object);
util.inherits(Client, events.EventEmitter);

/**
 * @callback onListenerCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The retrieved resource object.
 */

/**
 * Adds a listener to the end of the listeners array for the specified event.
 * No checks are made to see if the listener has already been added.
 * Multiple calls passing the same combination of event and listener will result in the listener being added multiple times.
 *
 * @param string event - Name of event to listen on.
 * @param {onListenerCallback} listener - Function to call when event is emitted.
 */
Client.prototype.on = function() {
  var args = Array.prototype.slice.call(arguments);

  // If we're running late to the party and the client has already
  // emitted the ready event, then run the callback directly.
  if (args.length === 2 && args[0] === 'ready' && _.isFunction(args[1])) {
    var callback = args[1];
    if (this._isReady) {
      callback(this);
      return this;
    }
  }

  return events.EventEmitter.prototype.on.apply(this, args);
};

/**
 * @callback getCurrentTenantCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} tenant - The retrieved Tenant object.
 */

/**
 * Retrieves an access token resource
 *
 * @param {Object} [options] - Options.
 * @param {getAccessTokenCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getAccessToken = function() {
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return this.getResource(href, options, require('./resource/AccessToken'), callback);
};


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

  self._dataStore.getResource('/tenants/current', options, require('./resource/Tenant'), function(err, tenant) {
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
