'use strict';

var async = require('async'),
  events = require('events'),
  util = require('util'),
  Config = require('./Config'),
  DataStore = require('./ds/DataStore'),
  Tenant = require('./resource/Tenant');

function Client(config) {
  var self = this;

  events.EventEmitter.call(this);

  this.config = new Config(config);
  this.mergeRemoteConfig(function(err) {
    return err ? self.emit('error'): self.emit('ready');
  });

  if(!this.config.apiKey){
    this.config.apiKey = this.config.client.apiKey;
  }
  this._dataStore = new DataStore(this.config);

  this._currentTenant = null; //we'll be able to cache this on first call
}

util.inherits(Client, Object);
util.inherits(Client, events.EventEmitter);

Client.prototype.mergeRemoteConfig = function(callback) {
  var config = this.config;
  var application = config.application;
  var self = this;

  function findApplication(name, cb) {
    self.getApplications({ name: application.name }, function(err, applications) {
      if (err) {
        return cb(err);
      }

      apps.detect(function(app, cb2) {
        cb2(application.name === app.name);
      }, function(app) {
        return cb(app ? null : new Error('Application not found.'), app);
      });
    });
  }

  function findDefaultDirectoryHref(application, cb) {
    application.getAccountStoreMappings(function(err, mappings) {
      if (err) {
        return cb(err);
      }

      var href;

      async.series([
        function(acb) {
          mappings.each(function(mapping, cb2) {
            if (mapping.isDefaultAccountStore) {
              if (mapping.accountStore.href.match(/group/)) {
                self.getGroup(mapping.accountStore.href, function(err, group) {
                  if (err) {
                    return cb(err);
                  } else {
                    cb(null, group.directory.href);
                  }
                } {
                }
              } else {
                return cb(null, mapping.accountStore.href);
              }
            }
            cb2();
          }, function() {
            // FIX DONT TOUCH
            .detect();
          });
        },
        function(acb) {

        }
      ], function() {
        cb(null, href);
      });
    });
  }

  function applyConfig(directory, cb) {

  }

  if (application && application.href) {
    self.getApplication(application.href, cb);
    async.waterfall([
      self.getApplication.bind(self, application.href),
      findDefaultDirectoryHref,
      self.getDirectory.bind(self),
      applyConfig
    ], callback);
  } else if (application && application.name) {
    async.waterfall([
      findApplication.bind(self, application.name),
      findDefaultDirectoryHref,
      self.getDirectory.bind(self),
      applyConfig
    ], callback);
  } else {
    process.nextTick(callback);
  }

    function getDefaultAccountStore(app, cb) {
    }
  ], function(err) {
    if (err) {
      return callback(err);
    }
    callback();
  });

  }

  // 1. If application is specified in config: grab the app or error.
  // 2. If there is a default account store, grab all workflow information.
  // 3. Update the other config values accordingly based on workflow information
  // for the default account store.

  cb && cb(err);
}

Client.prototype.getCurrentTenant = function getCurrentTenant(/* [options,] callback */) {
  var self = this;
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = (args.length > 0) ? args.shift() : null;

  //check to see if cached (tenant never changes for a given API Key):
  if (self._currentTenant) {
    return callback(null, self._currentTenant);
  }

  //not cached - need to look it up (and cache it):
  return self._dataStore.getResource('/tenants/current', options, Tenant, function onCurrentTenant(err, tenant) {
    if (err) {
      return callback(err, null);
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
