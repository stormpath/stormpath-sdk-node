var MemoryStore = require('./memoryStore');
var CacheStats = require('./stats');
var CacheEntry = require('./entry');

var defaults= {
  store: MemoryStore,
  ttl: 5 * 60,
  tti: 5 * 60
};

/**
 * Cache abstractions
 * A unified interface to different implementations of data caching.
 *
 * @param [store=MemoryStore]
 * @param {number} [ttl=5*60] - seconds
 * @param {number} [tti=5*60] - seconds
 * @constructor
 */
// todo: change signature to Cache(options)
function Cache(store, ttl, tti, options){
  if (!this instanceof Cache){
    return new Cache(store, ttl, tti, options);
  }

  if (arguments.length === 1){
    options = store;
    store = options.store;
    ttl = options.ttl;
    tti = options.tti;
  }
  options = options || {};

  var self = this;
  //noinspection JSHint
  self.store = new (store || defaults.store)(options);
  self.ttl = ttl || defaults.ttl;
  self.tti = tti || defaults.tti;
  self.stats = new CacheStats();
}

Cache.prototype.get = function(key, cb){
  var self = this;
  self.store.get(key, function(err, entry){
    if (err || !entry){
      return cb(err, null);
    }

    if (entry.isExpired()){
      self.stats.miss(true);
      return self.store.delete(key, function(err, status){
        return cb(err, null);
      });
    }

    self.stats.hit();
    // what point to touch entry if we not updating cache store
    // will work for memory store but will not for redis store
    entry.touch();
    return cb(null, entry.value);
  });
};

/**
 *
 * @param key
 * @param value
 * @param {boolean} [_new=true]
 * @param cb
 */
Cache.prototype.put = function(key, value, _new, cb){
  if (typeof _new === 'function'){
    cb = _new;
    _new = true;
  }
  this.stats.put(_new);
  this.store.set(key, new CacheEntry(value), cb);
};

Cache.prototype.delete = function(key, cb){
  this.stats.delete();
  this.store.delete(key, cb);
};

Cache.prototype.clear = function(cb){
  this.stats.clear();
  this.store.clear(cb);
};

Cache.prototype.size = function(cb){
  this.store.size(cb);
};

module.exports = Cache;