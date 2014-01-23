'use strict';

var util = require('util');

// ============== Resource ==========================

function Resource(data, dataStore) {
  data = data || {};
  for( var key in data ) {
    if (data.hasOwnProperty(key)) {
      this[key] = data[key];
    }
  }

  var ds = null; //private var, not enumerable
  Object.defineProperty(this, 'dataStore', {
    get: function getDataStore() { return ds; },
    set: function setDataStore(dataStore) { ds = dataStore; }
  });
  if (dataStore) {
    this.dataStore = dataStore;
  }
}
util.inherits(Resource, Object);

// ============== Instance Resource =================

function InstanceResource() {
  InstanceResource.super_.apply(this, arguments);
}
util.inherits(InstanceResource, Resource);

/*
InstanceResource.prototype.save = function saveResource(callback) {
};
*/

// ============== Collection Resource ===============

function CollectionResource() {
  CollectionResource.super_.apply(this, arguments);
}
util.inherits(CollectionResource, Resource);

module.exports = {
  Resource: Resource,
  InstanceResource: InstanceResource,
  CollectionResource: CollectionResource
};



