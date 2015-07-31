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
 * Queries the server for a resource by `href`, providing the result to `callback`.
 *
 * @param {String} href the URI of the resource to acquire - must always be the first argument.
 * @param {Object} query (optional, defaults to `undefined`) name/value pairs to use as query parameters to `href`
 * @param {Function} instanceCtor (optional, defaults to `InstanceResource`) The Constructor function to invoke for any Instance Resource returned by the server.  If the resource returned by the server is a single resource, this function is used to construct the reasource.  If the resource returned by the server is a collection, the `instanceCtor` is used to construct each resource in the collection's `items` field.
 * @param {Function} callback the callback function to invoke with the constructed Resource. The callback's first argument is an `Error` object, the second is the constructed resource.  Must always be the last argument.
 * @return {void} result is provided to `callback`.
 * @method getResource
 * @version 0.1
 */
Client.prototype.getResource = function getResource(/* href, [query,] [InstanceConstructor,] callback */) {
  return this._dataStore.getResource.apply(this._dataStore, arguments);
};

/**
 * Creates a new resource on the server as a child of the specified `parentHref` location.  `parentHref` must be a collection resource endpoint.
 *
 * @param {String} parentHref the URI of the parent collection under which the new resource will be created as a child - must always be the first argument.
 * @param {Object} query (optional, defaults to `undefined`) name/value pairs to use as query parameters to `parentHref`
 * @param {Object} data the resource (name/value pairs) to send to the server.
 * @param {Function} instanceCtor (optional, defaults to `InstanceResource`)  The Constructor function to invoke for any instance resource returned by the server.  If the request result is a single resource, this function is used to construct the resource.  If the request result is a collection, the `instanceCtor` is used to construct each resource in the collection's `items` field.
 * @param {Function} callback the callback function to invoke with the constructed Resource. The callback's first argument is an `Error` object, the second is the constructed resource. Must always be the last argument.
 * @return {void} result is provided to `callback`.
 * @method createResource
 * @version 0.1
 */
Client.prototype.createResource = function createResource(/* parentHref, [query,] data, [InstanceConstructor,] callback */) {
  this._dataStore.createResource.apply(this._dataStore, arguments);
};

//convenience methods:

Client.prototype.getApplications = function getClientApplications(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;
  return self.getCurrentTenant(function onGetCurrentTenantForApplications(err, tenant) {
    if (err) {
      return callback(err, null);
    }
    return tenant.getApplications(options, callback);
  });
};

Client.prototype.createApplication = function createClientApplication(/* app, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var app = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;
  return self.getCurrentTenant(function onGetCurrentTenantToCreateApplication(err, tenant) {
    if (err) {
      return callback(err, null);
    }
    return tenant.createApplication(app, options, callback);
  });
};

Client.prototype.getDirectories = function getClientDirectories(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;
  return self.getCurrentTenant(function onGetCurrentTenantForDirectories(err, tenant) {
    if (err) {
      return callback(err, null);
    }
    return tenant.getDirectories(options, callback);
  });
};

Client.prototype.createDirectory = function createClientDirectory(/* dir, [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var dir = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;
  return self.getCurrentTenant(function onGetCurrentTenantToCreateDirectory(err, tenant) {
    if (err) {
      return callback(err, null);
    }
    return tenant.createDirectory(dir, options, callback);
  });
};

// Individual resource type convenience methods:
Client.prototype.getAccount = function getClientAccount(/* href, [options,], callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.getResource(href, options, require('./resource/Account'), callback);
};
Client.prototype.getApplication = function getClientApplication(/* href, [options,], callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.getResource(href, options, require('./resource/Application'), callback);
};
Client.prototype.getDirectory = function getClientDirectory(/* href, [options,], callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.getResource(href, options, require('./resource/Directory'), callback);
};
Client.prototype.getGroup = function getClientGroup(/* href, [options,], callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var href = args.shift();
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  return self.getResource(href, options, require('./resource/Group'), callback);
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
