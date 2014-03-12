'use strict';

var utils = require('../utils');

var Resource = require('./Resource');
var InstanceResource = require('./InstanceResource');

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

function ensureInstanceResources(items, InstanceConstructor, dataStore) {

  var InstanceCtor = utils.valueOf(InstanceConstructor, InstanceResource);

  if (!items || items.length === 0 || items[0] instanceof InstanceCtor /* already converted */) {
    return items;
  }

  var convertedItems = [];

  for(var i = 0; i < items.length; i++) {
    var obj = items[i];
    //we have to call instantiate via a require statement to avoid a circular dependency
    //(instantiate references CollectionResource):
    var converted = require('./ResourceFactory').instantiate(InstanceCtor, obj, null, dataStore);
    convertedItems.push(converted);
  }

  return convertedItems;
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

module.exports = CollectionResource;