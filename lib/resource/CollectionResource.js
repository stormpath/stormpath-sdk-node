'use strict';

var _ = require('underscore');
var async = require('async');

var InstanceResource = require('./InstanceResource');
var Resource = require('./Resource');
var utils = require('../utils');

// ==============================================
// Collection Resource
// ==============================================
function wrapAsyncCallToAllPages(coll, func, args, callbackWrapper){
  var page = _.pick(coll, [
    'href', 'query', 'offset', 'limit', 'items',
    'dataStore', 'instanceConstructor']);

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

  function worker(task, cb){
    if (!task.collection.items || !task.collection.items.length){
      return cb();
    }

    async.parallel([
      function(parallel_cb){
        if (callbackWrapper.isDone){
          return parallel_cb();
        }

        var callArgs = Array.prototype
          .concat(
            [task.collection.items],
            !!callbackWrapper.wrapPageArgs ? callbackWrapper.wrapPageArgs(args) : args,
            callbackWrapper.wrapPageCallback(parallel_cb));
        func.apply(this, callArgs);
      },
      function(parallel_cb){
        if (callbackWrapper.isDone){
          return parallel_cb();
        }

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

  function CallbackWrapper(argsLength){
    var res = [];

    this.wrapPageCallback = function wrapPageCallback(cb){
      return function funcCallback(err, result){
        if (argsLength === 1){
          result = err;
          err = null;
        }

        res = Array.prototype.concat.call(res, result);

        cb(err, result);
      };
    };

    this.wrapCallback = function(callback){
      return function(err){
        if (argsLength === 1){
          return callback(res);
        }
        callback(err, res);
      };
    };
  }

  function Every(){
    var res = true;
    this.wrapPageCallback = function wrapPageCallback(cb){
      return function funcCallback(result){
        res = res && result;
        cb(result);
      };
    };

    this.wrapCallback = function(callback ){
      return function(){
        callback(res);
      };
    };
  }

  function Some (){
    var res = false;
    this.isDone = false;
    var that = this;
    this.wrapPageCallback = function wrapPageCallback(cb){
      return function funcCallback(result){
        that.isDone = !!result;
        res = res || result;
        cb(result);
      };
    };

    this.wrapCallback = function(callback ){
      return function(){
        callback(res);
      };
    };
  }

  function Detect(){
    var res = null;
    var that = this;
    this.isDone = false;

    this.wrapPageCallback = function wrapPageCallback(cb){
      return function funcCallback(result){
        that.isDone = !!result;
        res = res || result;
        cb(res);
      };
    };

    this.wrapCallback = function(callback ){
      return function(){
        callback(res);
      };
    };
  }

  function Reduce(){
    var res = null;
    this.wrapPageCallback = function wrapPageCallback(cb){
      return function funcCallback(err, result){
        res = result;
        cb(err, result);
      };
    };

    this.wrapPageArgs = function(args){
      var memo = args[0];
      var iter = args[1];
      res = res || memo;
      // should be memo
      return [res, iter];
    };

    this.wrapCallback = function(callback ){
      return function(err, result){
        res = res || result;
        callback(err, res);
      };
    };
  }

  function ReduceRight(){
    var memo = null;
    var items = [];
    var iterator, callback;

    this.wrapPageCallback = function wrapPageCallback(cb){
      return cb;
    };

    this.wrapArgs = function(args){
      memo = args[0];
      iterator = args[1];
      callback = args[2];
      return [
        function(item, cb){
          items.push(item);cb();
        },
        function(){
          console.log(arguments);
        }
      ];
    };

    this.wrapCallback = function(){
      return function(err){
        if (err) {
          return callback(err);
        }

        async.reduceRight(items, memo, iterator, callback);
      };
    };
  }

  function SortBy(){
    var items = [];
    var iterator, callback;

    this.wrapPageCallback = function wrapPageCallback(cb){
      return cb;
    };

    this.wrapArgs = function(args){
      iterator = args[0];
      callback = args[1];
      return [
        function(item, cb){
          items.push(item);cb();
        },
        function(){
        }
      ];
    };

    this.wrapCallback = function(){
      return function(err){
        if (err) {
          return callback(err);
        }

        async.sortBy(items, iterator, callback);
      };
    };
  }

  var W1 = function(){ return new CallbackWrapper(1);};
  var W2 = function(){ return new CallbackWrapper(2);};

  var methods = {
    each: {wrapper: W2}, eachSeries: {wrapper: W2}, eachLimit: {wrapper: W2},
    forEach: {wrapper: W2}, forEachSeries: {wrapper: W2}, forEachLimit: {wrapper: W2},
    map: {wrapper: W2}, mapSeries: {wrapper: W2}, mapLimit:{wrapper: W2},
    filter: {wrapper: W1}, filterSeries: {wrapper: W1},
    select: {wrapper: W1}, selectSeries: {wrapper: W1},
    reject: {wrapper: W1}, rejectSeries: {wrapper: W1},
    reduce: {wrapper: Reduce}, inject: {wrapper: Reduce}, foldl: {wrapper: Reduce},
    reduceRight: {wrapper: ReduceRight, method: 'eachSeries'},
    foldr: {wrapper: ReduceRight, method: 'eachSeries'},
    detect: {wrapper: Detect},detectSeries: {wrapper: Detect},
    sortBy: {wrapper: SortBy, method: 'eachSeries'},
    some: {wrapper: Some}, any: {wrapper: Some},
    every: {wrapper: Every}, all: {wrapper: Every},
    concat: {wrapper: W2},concatSeries: {wrapper: W2}
  };

  function wrap(func, Wrapper){
    return function(){
      var args = Array.prototype.slice.call(arguments);

      if (typeof args[args.length - 1] !== 'function' && typeof args[args.length - 2] !== 'function'){
        // no iterator function, no callback - ignore call
        return;
      }

      if (typeof args[args.length - 2] !== 'function'){
        args.push(function(){});
      }

      var wrapper = new Wrapper();
      if (wrapper.wrapArgs){
        args = wrapper.wrapArgs(args);
      }
      wrapAsyncCallToAllPages(this, func, args, wrapper);
    };
  }

  _.each(methods, function(opts, method){
    CollectionResource.prototype[method] = wrap(async[opts.method || method], opts.wrapper);
  });
})();

module.exports = CollectionResource;
