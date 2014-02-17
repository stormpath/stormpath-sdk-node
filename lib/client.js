'use strict';

var util = require('util'),
  DataStore = require('./datastore'),
  Tenant = require('./tenant');

function Client(config) {
  this._dataStore = new DataStore(config);
  this._currentTenant = null; //we'll be able to cache this on first call
}
util.inherits(Client, Object);

Client.prototype.getCurrentTenant = function getCurrentTenant(callback) {

  var _this = this;

  //check to see if cached (tenant never changes for a given API Key):
  if (_this._currentTenant) {
    callback(null, this._currentTenant);
    return;
  }

  //not cached - need to look it up (and cache it):
  _this._dataStore.getResource('/tenants/current', Tenant, function onCurrentTenant(err, tenant) {
    if (err) {
      callback(err, null);
      return;
    }
    _this._currentTenant = tenant;
    callback(null, tenant);
  });
};

Client.prototype.getResource = function getResource(/*href, query, ctor, callback*/) {
  this._dataStore.getResource.apply(this._dataStore, arguments);
};

module.exports = Client;