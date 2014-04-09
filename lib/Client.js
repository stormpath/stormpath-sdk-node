'use strict';

var util = require('util'),
  DataStore = require('./ds/DataStore'),
  Tenant = require('./resource/Tenant');

function Client(config) {
  this._dataStore = new DataStore(config);
  this._currentTenant = null; //we'll be able to cache this on first call
}
util.inherits(Client, Object);

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