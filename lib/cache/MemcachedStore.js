'use strict';

// todo: create store provider and register redis store only for node.js version
var Memcached = require("memcached");
var CacheEntry = require('./CacheEntry');

/**
 * Caching implementation that uses Redis as data storage.
 * @constructor
 * @param {string=} [host='localhost']
 * @param {number=} [port=6379]
 * @param {number=} [db=0]
 */
function MemcachedStore(opt){
  this._options = opt || {};
  this.memcached = MemcachedStore._createClient(opt);
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