'use strict';

var utils = require('../utils');

/**
* @class
*
* @description
* A bare-bones base representation of a resource in the Node Stormpath SDK.
* All resource instances must be based on this class (or a class that augments
* it).
*
* @param {Object=} data
* JavaScript object representing the resource's raw data
*
* @param {DataStore} dataStore
* The application's {@link DataStore}
*/
function Resource(data, dataStore) {
  // require moved here intentionally because of
  // issue related to
  var DataStore = require('../ds/DataStore');
  if (!dataStore && data instanceof DataStore){
    dataStore = data;
    data = null;
  }
  data = data || {};

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      this[key] = data[key];
    }
  }

  var ds = null; //private var, not enumerable
  Object.defineProperty(this, 'dataStore', {
    get: function getDataStore() {
      return ds;
    },
    set: function setDataStore(dataStore) {
      ds = dataStore;
    }
  });
  if (dataStore) {
    this.dataStore = dataStore;
  }
}
utils.inherits(Resource, Object);

module.exports = Resource;
