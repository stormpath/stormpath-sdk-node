'use strict';

var utils = require('../utils');

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

  if (data._links && data._links.self) {
    this.href = data._links.self.href;
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
