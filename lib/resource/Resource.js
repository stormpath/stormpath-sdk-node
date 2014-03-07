'use strict';

var utils = require('../utils');

function Resource(data, dataStore) {
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