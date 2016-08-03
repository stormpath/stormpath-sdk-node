'use strict';

var _ = require('underscore');
var async = require('async');

var InstanceResource = require('./InstanceResource');
var Resource = require('./Resource');
var utils = require('../utils');

/**
 * @typedef {Object} CollectionQueryOptions
 *
 * This object allows you to add query parameters when requesting collections
 * from the Stormpath REST API. The query parameters allow you to sort, search,
 * and limit the results that are returned. For more information, please see:
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#collection-resources REST API Reference: Collection Resources}.
 *
 * @property {String} [expand]
 * Comma-separated list of linked resources to expand on the returned resources.
 * Not all links are available for expansion. For more information, please see:
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#links REST API Reference: Links}.
 *
 * Example: `'customData, directory'`
 *
 * @example
 * // Expand custom data and directory when getting all accounts.
 * client.getAccounts({ expand: 'customData, directory' });
 *
 * @property {Number} [limit]
 * The maximum number of collection items to return for a single request.
 * Minimum value is 1. Maximum value is 100. Default is 25.
 *
 * @property {Number} [offset]
 * The zero-based starting index in the entire collection of the first item to
 * return. Default is 0.
 *
 * @property {String} [orderBy]
 * URL-encoded comma-separated list of ordering statements. Each ordering
 * statement identifies a sortable attribute, and whether you would like the
 * sorting to be ascending or descending.
 *
 * Example: `'email,username asc'`
 *
 * @example
 * // Get all accounts, sorting by email, then username, ascending.
 * application.getAccounts({ orderBy: 'email,username asc' }, callbackFn);
 *
 * @property {String} [q]
 * Stormpath will perform a case-insensitive matching query on all viewable
 * attributes in all the resources in the Collection. Note that “viewable” means
 * that the attribute can be viewed by the current caller. For full
 * documentation of filter searching in the Stormpah API, please see:
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#filter-search REST API Reference: Filter Search}.
 *
 * @example
 * // Find any account that has a searchable attribute containing the text “Joe”:
 * application.getAccounts({ q: 'Joe' }, callbackFn);
 *
 * @property {String} [attribute]
 * Find objects by a specific attribute match, such as an email address. Not
 * all attributes are available for matching on all resource types. Please
 * refer to the specific resource type in this documentation, or see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#attribute-search REST API Reference: Attribute Search}.
 *
 * @example
 * // Find all accounts with this email address.
 * application.getAccounts({ email: 'foo@bar.com'}, callbackFn);
 */

function wrapAsyncCallToAllPages(coll, func, args, callbackWrapper){
  var page = _.pick(coll, [
    'href', 'query', 'offset', 'limit', 'items',
    'dataStore', 'instanceConstructor']);

  var callback = args.pop();

  function getNextPage(page, callback) {
    // There is no next page.
    if (page.items.length < page.limit) {
      return callback();
    }

    // We've fully exhausted the current page. There could be another one on the server, so
    // we have to execute another query to continue to the next page if one exists.
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
            callbackWrapper.wrapPageCallback(parallel_cb.bind(this, null)));
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
    // We have to call instantiate via a require statement to avoid a circular dependency
    // (instantiate references CollectionResource).
    var converted = require('./ResourceFactory').instantiate(InstanceCtor, obj, null, dataStore);
    convertedItems.push(converted);
  }

  return convertedItems;
}

/**
 * @class CollectionResource
 *
 * @description
 * Encapsulates a collection resource, such as an Application's Accounts
 * collection, making it possible to iterate through the collection in an
 * asynchronous manner. You do not need to manually construct a
 * CollectionResource. Rather, you will obtain a resource collection from a
 * getter method, such as {@link Application#getAccounts
 * Application.getAccounts()}.
 *
 * Every CollectionResource has the following iteration methods, modeled after
 * the [caolan/async library](https://github.com/caolan/async), for iterating
 * over the paginated collection in an asynchronous manner.
 *
 * The collection resource will make multiple attempts to the REST API, to
 * request each page in the collection. You can reduce
 * the number of REST API calls by increasing the page size when you get the
 * collection for the first time, using the `limit` option. See {@link
 * CollectionQueryOptions}.
 */
function CollectionResource(/*data, query, InstanceCtor, dataStore*/) {

  var args = Array.prototype.slice.call(arguments);

  var data = args[0];
  var dataStore = args[args.length - 1];
  var query = null;
  var InstanceCtor = InstanceResource; // Default for generic resource instances.

  // Check if query params supplied.
  if (args[1] instanceof Object && !(args[1] instanceof Function)) {
    query = args[1];
  }

  // Check if a type-specific resource constructor function was supplied.
  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg instanceof Function && utils.isAssignableFrom(Resource, secondToLastArg)) {
    InstanceCtor = secondToLastArg;
  }

  // Convert raw items array (array of objects) to an array of Instance Resources.
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

/**
 * @name CollectionResource#concat
 *
 * @function
 *
 * @description
 * Visit each resource in the collection and concatenate the return values of
 * the `iterator`. Similar to {@link CollectionResource#map map}, but the
 * return values should be arrays, and all arrays will be concatendated before
 * being provied to the `doneCallback`.
 *
 * @param {Function} iterator
 * The function to call, for each resource in the collection. Will be called
 * with `(resource, next)`. The `next(err, results)` function must be called to
 * advance to the next resource. If an `err` value is passed to next, the
 * iteration will stop and the `doneCallback` will be called with the `err`
 * value.
 *
 * @param {Function} doneCallback
 * The function to call when iteration has ended. Will be called with `(err,
 * [concatenatedResults])`.
 *
 * @example
 * // Find all orders from all accounts, that are stored in your SQL database
 *
 * function iterator(account, next) {
 *   // Talk do your SQL databse, pseudo-code:
 *   sqlQuery('SELECT * FROM ORDERS WHERE userId=\"' + encodeURIComponent(account.customData.sqlId) + '\";', next);
 * }
 *
 * function doneCallback(err, orders) {
 *   if (!err) {
 *     console.log(orders);
 *   }
 * }
 *
 * application.getAccounts({ expand: 'customData' }, function (err, collection) {
 *   if (!err) {
 *     collection.concat(iterator, donCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#concatLimit
 *
 * @function
 *
 * @description
 * The same interface as `concat`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#concat concat}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#concat concat}.
 */

/**
 * @name CollectionResource#concatSeries
 *
 * @function
 *
 * @description
 * The same interface as `concat`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#concat concat}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#concat concat}.
 */

/**
 * @name CollectionResource#detect
 *
 * @function
 *
 * @description
 * Visit each resource in the collection and return the first resource that
 * passes a truth test in the iterator. The iterator is applied in parallel, and
 * the first iterator to return true will end the iteration.
 *
 * @param {Function} iterator
 * The function to call, for each resource in the collection. Will be called
 * with `(resource, next)`. The `next(err, test)` function must be called to
 * advance to the next resource. Iteration is ended as soon as a truthy value
 * is provided to either `err` or `test`.
 *
 * @param {Function} doneCallback
 * The function to call when iteration has ended. Will be called with `(err,
 * foundResource)`.
 *
 * @example
 * // Find the first account that likes pizza.
 *
 * function iterator(account, next) {
 *   next(null, account.customData.favoriteFood === 'pizza');
 * }
 *
 * function doneCallback(err, foundAccount) {
 *   if (!err) {
 *     console.log('Guess who likes pizza??').
 *     console.log(foundAccount.fullName);
 *   }
 * }
 *
 * application.getAccounts({ expand: 'customData' }, function (err, collection) {
 *   if (!err) {
 *     collection.detect(iterator, donCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#detectLimit
 *
 * @function
 *
 * @description
 * The same interface as `detect`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#detect detect}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#detect detect}.
 */

/**
 * @name CollectionResource#detectSeries
 *
 * @function
 *
 * @description
 * The same interface as `detect`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#detect detect}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#detect detect}.
 */

/**
 * @name CollectionResource#each
 *
 * @function
 *
 * @description
 * Visit each resource in the collection. The `iterator` will be called in
 * parallel.
 *
 * @param {Function} iterator
 * The function to call, for each resource in the collection. Will be called
 * with `(resource, next)`. The `next()` function must be called in order to
 * advance to the next resource. If an `err` value is passed to next, the
 * iteration will stop and the `doneCallback` will be called with the `err`
 * value.
 *
 * @param {Function} doneCallback
 * The function to call when all items have been visited. If `next(err)` has
 * been used, the `err` will be passed to this function.
 *
 * @example
 * function iterator(account, next) {
 *   console.log('Found account for ' + account.givenName + ' (' + account.email + ')');
 *   next();
 * }
 *
 * function doneCallback(err) {
 *   if (!err) {
 *     console.log('All accounts have been visited.').
 *   }
 * }
 *
 * application.getAccounts({ email: 'foo@example.com' }, function (err, collection) {
 *   if (!err) {
 *     collection.each(iterator, doneCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#eachLimit
 *
 * @function
 *
 * @description
 * The same interface as `each`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#each each}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#each each}.
 */

/**
 * @name CollectionResource#eachSeries
 *
 * @function
 *
 * @description
 * The same interface as `each`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#each each}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#each each}.
 */

/**
 * @name  CollectionResource#every
 *
 * @function
 *
 * @description
 * Visit each resource in the collection and return true if all resources pass
 * a truth test in the `iterator`. The `iterator` will be called in parallel.
 *
 * @param {Function} iterator
 * The function to call, for each resource in the collection. Will be called
 * with `(resource, next)`. The `next(err, test)` function must be called to
 * advance to the next resource. If an `err` value is passed to next, the
 * iteration will stop and the `doneCallback` will be called with the `err`
 * value.
 *
 * @param {Function} doneCallback
 * The function to call when iteration has ended. Will be called with `(err,
 * test)`.
 *
 * @example
 * // Does everyone like Brie cheese?
 *
 * function iterator(account, next) {
 *   next(null, account.customData.likesBrie === true);
 * }
 *
 * function doneCallback(err, test) {
 *   if (!err && test === true) {
 *     console.log('Everyone likes Brie??');
 *   }
 * }
 *
 * application.getAccounts({ expand: 'customData' }, function (err, collection) {
 *   if (!err) {
 *     collection.every(iterator, donCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#everyLimit
 *
 * @function
 *
 * @description
 * The same interface as `every`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#every every}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#every every}.
 */

/**
 * @name CollectionResource#everySeries
 *
 * @function
 *
 * @description
 * The same interface as `every`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#every every}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#every every}.
 */

/**
 * @name CollectionResource#filter
 *
 * @function
 *
 * @description
 * Visit each resource in the collection, and filter down to a new set of
 * resources, based on a truth test that is evaluated by the `iterator`.
 * The `iterator` will be called in parallel.
 *
 * @param {Function} iterator
 * The function to call for each resource in the collection. Will be called
 * with `(resource, next)`. The `next(err, test)` function must be called in order to
 * advance to the next resource. The `test` value should be a boolean value that
 * indicates if the resource should be included in the filtered collection.
 *
 * If an `err` value is passed to next, the iteration will stop and the
 * `doneCallback` will be called with the `err` value.
 *
 * @param {Function} doneCallback
 * The function to call when all items have been visited. Will be called with
 * `(err, [filteredResources])`.
 *
 * @example
 * // Find all accounts that have the 'paid' plan property, in custom data.
 *
 * function iterator(account, next) {
 *   next(null, account.customData.plan === 'paid');
 * }
 *
 * function doneCallback(err, paidAccounts) {
 *   if (!err) {
 *     console.log('All paid accounts:').
 *     console.log(paidAccounts);
 *   }
 * }
 *
 * application.getAccounts({ expand: 'customData' }, function (err, collection) {
 *   if (!err) {
 *     collection.filter(iterator, doneCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#filterLimit
 *
 * @function
 *
 * @description
 * The same interface as `filter`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#filter filter}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#filter filter}.
 */

/**
 * @name CollectionResource#filterSeries
 *
 * @function
 *
 * @description
 * The same interface as `filter`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#filter filter}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#filter filter}.
 */

/**
 * @name CollectionResource#map
 *
 * @function
 *
 * @description
 * Visit each resource in the collection and produce a new value for that
 * resource. The `iterator` will be called in parallel.
 *
 * @param {Function} iterator
 * The function to call for each resource in the collection. Will be called
 * with `(resource, next)`. The `next(err, value)` function must be called with
 * the new value in order to advance to the next resource. If an `err` value is
 * passed to next, the iteration will stop and the `doneCallback` will be called
 * with the `err` value.
 *
 * @param {Function} doneCallback
 * The function to call when all items have been visited. Will be called with
 * `(err, [transformedResources])`.
 *
 * @example
 * // Pluck the email address from all accounts.
 *
 * function iterator(account, next) {
 *   next(null, account.email);
 * }
 *
 * function doneCallback(err, emails) {
 *   if (!err) {
 *     console.log('All email addresses in this application:').
 *     console.log(emails);
 *   }
 * }
 *
 * application.getAccounts(function (err, collection) {
 *   if (!err) {
 *     collection.map(iterator, doneCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#mapLimit
 *
 * @function
 *
 * @description
 * The same interface as `map`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#map map}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#map map}.
 */

/**
 * @name CollectionResource#mapSeries
 *
 * @function
 *
 * @description
 * The same interface as `map`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#map map}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#map map}.
 */

/**
 * @name CollectionResource#reduce
 *
 * @function
 *
 * @description
 * Visit each resource in the collection and use the `iterator` to reduce down
 * to a new value. The `iterator` will be called in parallel.
 *
 * @param {*} initialValue
 * The initial value that will then be passed to the `iterator` as `result`,
 * this is the value that you will mutate over time as the iterator is called
 * with every resource in the collection.
 *
 * @param {Function} iterator
 * The function to call, for each resource in the collection. Will be called
 * with `(result, resource, next)`. The `next(err, result)` function must be
 * called to advance to the next resource. If an `err` value is passed to next,
 * the iteration will stop and the `doneCallback` will be called with the `err`
 * value.
 *
 * @param {Function} doneCallback
 * The function to call when iteration has ended. Will be called with `(err,
 * result)`.
 *
 * @example
 * // Find all the unique favorite colors, of all your accounts
 *
 * function iterator(result, account, next) {
 *   var color = account.customData.favoriteColor;
 *   if (result.indexOf(color) === -1) {
 *     result.push(color);
 *   }
 *   return result;
 * }
 *
 * function doneCallback(err, colors) {
 *   if (!err) {
 *     console.log(colors);
 *   }
 * }
 *
 * application.getAccounts({ expand: 'customData' }, function (err, collection) {
 *   if (!err) {
 *     collection.reduce([], iterator, donCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#reduceRight
 *
 * @function
 *
 * @description
 * The same interface as {@link CollectionResource#reduce reduce}, but operates
 * on the collection in reverse order.
 *
 * @param {*} initialValue
 * Same interface as {@link CollectionResource#reduce reduce}.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#reduce reduce}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#reduce reduce}.
 */

/**
 * @name CollectionResource#reject
 *
 * @function
 *
 * @description
 * The opposite of {@link CollectionResource#filter filter}. Removes values that
 * pass an async truth test.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#filter filter}, but removes
 * values if they pass the truth test.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#filter filter}.
 */

/**
 * @name CollectionResource#rejectLimit
 *
 * @function
 *
 * @description
 * The same interface as `reject`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#reject reject}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#reject reject}.
 */

/**
 * @name CollectionResource#rejectSeries
 *
 * @function
 *
 * @description
 * The same interface as `reject`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#reject reject}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#reject reject}.
 */

/**
 * @name CollectionResource#some
 *
 * @function
 *
 * @description
 * Visit each resource in the collection and return true if any of the resources
 * pass a truth test in the `iterator`. The `iterator` will be called in
 * parallel, but iteration stops once the test is true for any resource.
 *
 * @param {Function} iterator
 * The function to call for each resource in the collection. Will be called
 * with `(resource, next)`. The `next(err, test)` function must be called to
 * advance to the next resource. If an `err` value is passed to next, the
 * iteration will stop and the `doneCallback` will be called with the `err`
 * value.
 *
 * @param {Function} doneCallback
 * The function to call when iteration has ended. Will be called with `(err,
 * test)`.
 *
 * @example
 * // Does anyone like Brie cheese?
 *
 * function iterator(account, next) {
 *   next(null, account.customData.likesBrie === true);
 * }
 *
 * function doneCallback(err, test) {
 *   if (!err && test === true) {
 *     console.log('Some people like Brie.');
 *   }
 * }
 *
 * application.getAccounts({ expand: 'customData' }, function (err, collection) {
 *   if (!err) {
 *     collection.some(iterator, donCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#someLimit
 *
 * @function
 *
 * @description
 * The same interface as `some`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#some some}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#some some}.
 */

/**
 * @name CollectionResource#someSeries
 *
 * @function
 *
 * @description
 * The same interface as `some`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#some some}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#some some}.
 */

/**
 * @name  CollectionResource#sortBy
 *
 * @function
 *
 * @description
 * Visit each resource in the collection and return the resources in a sorted
 * array. The sort is determined by the sortable value that you your return in
 * the `iterator`.
 *
 * @param {Function} iterator
 * The function to call for each resource in the collection. Will be called
 * with `(resource, next)`. The `next(err, sortableValue)` function must be
 * called to advance to the next resource. If an `err` value is passed to next,
 * the iteration will stop and the `doneCallback` will be called with the `err`
 * value.
 *
 * @param {Function} doneCallback
 * The function to call when iteration has ended. Will be called with `(err,
 * test)`.
 *
 * @example
 * // Sort accounts by their birthday.
 *
 * function iterator(account, next) {
 *   next(null, account.customData.birthday);
 * }
 *
 * function doneCallback(err, sortedAccounts) {
 *   if (!err) {
 *     console.log(sortedAccounts);
 *   }
 * }
 *
 * application.getAccounts({ expand: 'customData' }, function (err, collection) {
 *   if (!err) {
 *     collection.sortBy(iterator, donCallback);
 *   }
 * });
 */

/**
 * @name CollectionResource#sortByLimit
 *
 * @function
 *
 * @description
 * The same interface as `sortBy`, but with a 2nd parameter that can be used to
 * limit the number of parallel workers.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#sortBy sortBy}.
 *
 * @param {Number} limit
 * The maximum number of parallel iterator workers.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#sortBy sortBy}.
 */

/**
 * @name CollectionResource#sortBySeries
 *
 * @function
 *
 * @description
 * The same interface as `sortBy`, but the `iterator` will be called in series,
 * not in parallel.
 *
 * @param {Function} iterator
 * Same interface as {@link CollectionResource#sortBy sortBy}.
 *
 * @param {Function} doneCallback
 * Same interface as {@link CollectionResource#sortBy sortBy}.
 */
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
    var that = this;
    this.isDone = false;

    this.wrapPageCallback = function wrapPageCallback(cb){
      return function funcCallback(result){
        that.isDone = !result;
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

      // Should be memo.
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
        // No iterator function, no callback - ignore call.
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
