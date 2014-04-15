'use strict';

var _ = require('underscore');
var async = require('async');
var utils = require('../utils');

var Resource = require('./Resource');
var InstanceResource = require('./InstanceResource');

// ==============================================
// Collection Resource
// ==============================================
function wrapAsyncCallToAllPages(coll, func, args, callbackWrapper){
  var page = _.pick(coll, [
    'href', 'query', 'offset', 'limit', 'items',
    'dataStore', 'instanceConstructor']);

  if (!args.length || 'function' !== typeof args[args.length-1] ||
    'function' !== typeof args[args.length-2]){
    throw new Error('Missing required param! ' +
      'Last two params should be iterator and callback functions');
  }

  var callback = args.pop();

  function getNextPage(page, callback) {
    // there are no next page
    if (page.items.length < page.limit) {
      return callback();
    }

    //we've fully exhausted the current page.  There could be another one on the server, so
    //we have to execute another query to continue to the next page if one exists:
    var nextQuery = utils.shallowCopy(page.query, {});
    nextQuery.offset = page.offset + page.items.length;
    nextQuery.limit = 100;

    page.dataStore.getResource(page.href, nextQuery, page.instanceConstructor,
      function onNextPage(err, collectionResource) {
        if (err) {
          return callback(err);
        }
        (typeof setImmediate !== 'undefined' ?
          setImmediate : process.nextTick)(function(){
          callback(null, collectionResource);
        });
      });
  }

  var res = [];
  function wrap(res, cb){
    return function funcCallback(err, result){
      res = Array.prototype.concat.call(res, result);
      cb(err, result);
    };
  }

  function worker(task, cb){
    if (!task.collection.items || !task.collection.items.length){
      return cb();
    }

    async.parallel([
      function(parallel_cb){
        var callArgs = Array.prototype
          .concat(
            [task.collection.items],
            args,
            callbackWrapper.wrapIterator(parallel_cb));
        func.apply(this, callArgs);
      },
      function(parallel_cb){
        getNextPage(task.collection, function(err, nextPage){
          if (err || !nextPage){
            return parallel_cb(err);
          }

          q.push({collection: nextPage});
          parallel_cb();
        });
      }
    ], cb);

  }

  var q = async.queue(worker, 1);
  q.drain = callbackWrapper.wrapCallback(callback);
  //function(err){ callback(err, res);};
  q.push({ collection: page });
}

function ensureInstanceResources(items, InstanceConstructor, dataStore) {

  var InstanceCtor = utils.valueOf(InstanceConstructor, InstanceResource);

  if (!items || items.length === 0 || items[0] instanceof InstanceCtor /* already converted */) {
    return items;
  }

  var convertedItems = [];

  for (var i = 0; i < items.length; i++) {
    var obj = items[i];
    //we have to call instantiate via a require statement to avoid a circular dependency
    //(instantiate references CollectionResource):
    var converted = require('./ResourceFactory').instantiate(InstanceCtor, obj, null, dataStore);
    convertedItems.push(converted);
  }

  return convertedItems;
}

function CollectionResource(/*data, query, InstanceCtor, dataStore*/) {

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

(function extendCollectionResourceWithAsyncMethods(){
  var methods = {'each': 2, 'eachSeries':2, 'eachLimit':2,
    'map': 2, 'mapSeries': 2, 'mapLimit':2,
    'filter': 1, 'filterSeries': 1,
    'reject': 1, 'rejectSeries': 1,
//  'reduce', 'reduceRight',
//  'detect','detectSeries',
//  'sortBy',
//  'some',
//  'every',
    'concat':2,'concatSeries':2
  };

  function CallbackWrapper(argsLength){
    var res = [];

    this.wrapIterator = function wrapIterator(cb){
      return function funcCallback(err, result){
        if (argsLength === 1){
          result = err;
          err = null;
        }

        res = Array.prototype.concat.call(res, result);

        cb(err, result);
      };
    };

    this.wrapCallback = function(callback ){
      return function(err){
        if (argsLength === 1){
          return callback(res);
        }
        callback(err, res);
      };
    };
  }

  function wrap(func, argLength){
    return function(){
      var args = Array.prototype.slice.call(arguments);
      wrapAsyncCallToAllPages(this, func, args, new CallbackWrapper(argLength));
    };
  }

  _.each(methods, function(argLength, method){
    CollectionResource.prototype[method] = wrap(async[method], argLength);
  });
})();

module.exports = CollectionResource;