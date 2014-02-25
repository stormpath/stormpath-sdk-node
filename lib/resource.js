/*jslint latedef: false */
'use strict';

var utils = require('./utils');

// ==============================================
// Resource
// ==============================================

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

// ==============================================
// Instance Resource
// ==============================================

function InstanceResource() {
  InstanceResource.super_.apply(this, arguments);
}
utils.inherits(InstanceResource, Resource);

InstanceResource.prototype.get = function getResource() {

  var args = Array.prototype.slice.call(arguments);

  var propName = args[0];
  var callback = args[args.length - 1];

  var val = this[propName];

  if (!val) {
    var e1 = new Error('There is no field named \'' + propName + '\'.');
    callback(e1, null);
    return;
  }
  if (!val.href) {
    var e2 = new Error('Field \'' + propName + '\' is not a reference property - it is not an object with an \'href\'' +
      'property.  Do not call \'get\' for ' +
      'non reference properties - access them normally, for example: resource.fieldName or resource[\'fieldName\']');
    callback(e2, null);
    return;
  }

  var query = null;
  var ctor = null;

  //check if query params supplied:
  if (args[1] instanceof Object && !(args[1] instanceof Function)) {
    query = args[1];
  }

  //check if a constructor function was supplied to instantiate a returned resource:
  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg instanceof Function && utils.isAssignableFrom(Resource, secondToLastArg)) {
    ctor = secondToLastArg;
  }

  this.dataStore.getResource(val.href, query, ctor, callback);
};

InstanceResource.prototype.save = function saveResource(callback) {
  this.dataStore.saveResource(this, callback);
};

InstanceResource.prototype.delete = function deleteResource(callback) {
  this.dataStore.deleteResource(this, callback);
};


// ==============================================
// Collection Resource
// ==============================================

function Page(collection) {
  var _this = this;
  this.href = collection.href;
  this.query = collection.query;
  this.offset = collection.offset;
  this.limit = collection.limit;
  this.items = collection.items;
  this.dataStore = collection.dataStore;

  this.each = function eachItem(callback) {
    if (!_this.items || _this.items.length === 0) {
      return;
    }

    var i = 0;

    for( ; i < _this.items.length; i++) {
      var item = _this.items[i];
      _this.offset++;
      callback(null, item, _this.offset-1);
    }

    if (i === _this.limit) {
      //we've fully exhausted the current page.  There could be another one on the server, so
      //we have to execute another query to continue to the next page if one exists:
      var nextQuery = utils.shallowCopy(_this.query, {});
      nextQuery.offset = _this.offset;
      nextQuery.limit = _this.limit;

      //console.log(nextQuery);

      _this.dataStore.getResource(_this.href, nextQuery, collection.instanceConstructor,
        function onNextPage(err, collectionResource) {
          if (err) {
            callback(err, null, null);
          }
          //console.log(collectionResource);
          _this.offset = collectionResource.offset;
          _this.limit = collectionResource.limit;
          _this.items = collectionResource.items;
          eachItem(callback); //async recursion FTW!
        });
    }
  };
}

function CollectionResource() {

  var args = Array.prototype.slice.call(arguments);

  var data = args[0];
  var dataStore = args[args.length - 1];
  var query = null;
  var InstanceCtor = InstanceResource; //default for generic resource instances

  //check if query params supplied:
  if (args[1] instanceof Object && !(args[1] instanceof Function)) {
    query = args[1];
  }

  //check if a type-specific resource constructor function was supplied:
  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg instanceof Function && utils.isAssignableFrom(Resource, secondToLastArg)) {
    InstanceCtor = secondToLastArg;
  }

  //convert raw items array (array of objects) to an array of Instance Resources:
  if (data && data.hasOwnProperty('items') && data.items.length > 0) {
    data.items = ensureInstanceResources(data.items, InstanceCtor, dataStore);
  }

  CollectionResource.super_.apply(this, [data, dataStore]);

  Object.defineProperty(this, 'instanceConstructor', {
    get: function getInstanceConstructor() {
      return InstanceCtor;
    },
    set: function setInstanceConstructor(TheInstanceCtor) {
      InstanceCtor = TheInstanceCtor;
    }
  });
  this.instanceConstructor = InstanceCtor;

  Object.defineProperty(this, 'query', {
    get: function getQuery() {
      return query;
    },
    set: function setQuery(aQuery) {
      query = aQuery;
    }
  });
  this.query = query;
}
utils.inherits(CollectionResource, Resource);

CollectionResource.prototype.each = function eachItem(callback) {
  var page = new Page(this);
  page.each(callback);
};

/**
 * A factory function that creates and returns a new Resource instance.  The server is not contacted in any way -
 * this function merely instantiates the object in memory and returns it.  Callers are responsible for persisting
 * the returned instance's state to the server if desired.
 *
 * @param InstanceConstructor the specific Resource constructor to call when creating the instance.
 * @param data the data acquired from the server
 * @param query any query that was provided to the server when acquiring the data
 * @param dataStore the dataStore used by the resource to communicate with the server. required for all resources.
 * @returns a new Resource memory instance
 */
function instantiate(InstanceConstructor, data, query, dataStore) {

  var Ctor = utils.valueOf(InstanceConstructor, InstanceResource);

  if (utils.isAssignableFrom(CollectionResource, Ctor)) {
    throw new Error("InstanceConstructor argument cannot be a CollectionResource.");
  }

  var q = utils.valueOf(query);

  var resource = null;

  if (data) {
    if (isCollectionData(data)) {
      resource = new CollectionResource(data, q, Ctor, dataStore);
    } else {
      resource = new Ctor(data, dataStore);
    }
  }
  return resource;
}

function ensureInstanceResources(items, InstanceConstructor, dataStore) {

  var InstanceCtor = utils.valueOf(InstanceConstructor, InstanceResource);

  if (!items || items.length === 0 || items[0] instanceof InstanceCtor /* already converted */) {
    return items;
  }

  var convertedItems = [];

  for(var i = 0; i < items.length; i++) {
    var obj = items[i];
    var converted = instantiate(InstanceCtor, obj, null, dataStore);
    convertedItems.push(converted);
  }

  return convertedItems;
}

function isCollectionData(data) {
  return data && data.hasOwnProperty('items') && data.hasOwnProperty('offset') && data.hasOwnProperty('limit');
}

module.exports = {
  Resource: Resource,
  InstanceResource: InstanceResource,
  CollectionResource: CollectionResource,
  instantiate: instantiate
};



