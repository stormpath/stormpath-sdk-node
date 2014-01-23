'use strict';

var util = require('util'),
  DataStore = require('./datastore'),
  Tenant = require('./tenant');

function Client(config) {
  this._dataStore = new DataStore(config);
}
util.inherits(Client, Object);

Client.prototype.getCurrentTenant = function getCurrentTenant(callback) {
  this._dataStore.getResource(Tenant, '/tenants/current', callback);
};

Client.prototype.getResource = function getResource(ResourceCtor, href, callback) {
  this._dataStore.getResource(ResourceCtor, href, callback);
};

module.exports = Client;