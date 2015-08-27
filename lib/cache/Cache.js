'use strict';

var _ = require('underscore');
var CacheEntry = require('./CacheEntry');
var CacheStats = require('./CacheStats');
var MemoryStore = require('./MemoryStore');

/**
 * Cache defaults
 * @type {{store: (*|MemoryStore|exports), ttl: number, tti: number}}
 */
var defaults = {
  store: MemoryStore,
  ttl: 5 * 60,
  tti: 5 * 60
};

/**
 * Cache abstractions
 * A unified interface to different implementations of data caching.
 *
 * @param [store=MemoryStore]
 * @param {number=} [ttl=5*60] - time to live in seconds
 * @param {number=} [tti=5*60] - time to idle in seconds
 * @params {object} options - cache configuration options
 * @constructor
 */
function Cache(options) {
  options = options || {};

  if (!(this instanceof Cache)) {
    return new Cache(options);
  }

  if (typeof options === 'function'){
    options = { store: options };
  }

  _.defaults(options, defaults);
  var Store = options.store;

  this.ttl = options.ttl;
  this.tti = options.tti;
  this.store = new Store(options);
  this.stats = new CacheStats();
}

Cache.prototype.get = function (key, cb) {

  var self = this;

  self.store.get(key, function (err, entry) {
    if (err || !entry) {
      return cb(err, null);
    }

    if (entry.isExpired(self.ttl, self.tti)) {
      self.stats.miss(true);
      return self.store.delete(key, function (err) {
        return cb(err, null);
      });
    }

    self.stats.hit();
    // what point to touch entry if we not updating cache store
    // will work for memory store but will not for redis store

    if (self.ttl !== self.tti) {
      entry.touch();
      self.store.set(key, entry, function(){});
    }

    return cb(null, entry.value);
  });
};

/**
 *
 * @param key
 * @param value
 * @param {boolean|function} [_new=true]
 * @param {function} cb
 */
Cache.prototype.put = function (key, value, _new, cb) {
  if (typeof _new === 'function') {
    cb = _new;
    _new = true;
  }
  this.stats.put(_new);
  this.store.set(key, new CacheEntry(value), cb);
};

Cache.prototype.delete = function (key, cb) {
  this.stats.delete();
  this.store.delete(key, cb);
};

Cache.prototype.clear = function (cb) {
  this.stats.clear();
  this.store.clear(cb);
};

Cache.prototype.size = function (cb) {
  this.store.size(cb);
};

module.exports = Cache;
