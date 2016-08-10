'use strict';

var Memcached = require('memcached');

// todo: create store provider and register redis store only for node.js version
var CacheEntry = require('./CacheEntry');

/**
 * @class
 *
 * @private
 *
 * @description
 *
 * Caching implementation that uses Redis as data storage.  If an existing
 * client instance is not provided, this constructor will create one.  Utilizes
 * the [memcached library](https://github.com/3rd-Eden/memcached).
 *
 * @param {Object} [options]
 * @param {Object} [options.client] A memcached client instance
 * @param {Object|String|Array} [options.connection] Memcached client constructor
 * connection string parameter.
 * @param {*} [options.*] Other options to pass to the Memcached client constructor.
 */
function MemcachedStore(opt){
  this._options = opt || {};
  this.memcached = opt.client || MemcachedStore._createClient(opt);
}

MemcachedStore._createClient = function creteMemcachedClient(opt){
  return new Memcached(opt.connection, opt.options);
};

MemcachedStore.prototype.get = function (key, cb){
  this.memcached.get(key, function(err, entry){
    return cb(err, !entry ? null : CacheEntry.parse(entry));
  });
};

MemcachedStore.prototype.set = function (key, val, cb){
  this.memcached.set(key, val, this._options.ttl, cb);
};

MemcachedStore.prototype.delete = function (key, cb){
  this.memcached.del(key, cb);
};

MemcachedStore.prototype.clear = function (cb){
  this.memcached.flush(cb);
};

MemcachedStore.prototype.size = function (cb){
  this.memcached.stats(function(err, stats){
    var size = stats && stats.length ? stats[0].curr_items : -1;
    cb(err, size);
  });
};

module.exports = MemcachedStore;
