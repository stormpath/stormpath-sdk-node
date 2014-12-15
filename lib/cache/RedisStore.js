'use strict';

var redis = require("redis");

var CacheEntry = require('./CacheEntry');

/**
 * Caching implementation that uses Redis as data storage.
 * @constructor
 * @param {string=} [host='localhost']
 * @param {number=} [port=6379]
 * @param {number=} [db=0]
 */
function RedisStore(opt){
  this._options = opt || {};
  if (opt.existingCache) {
    if (opt.existingCache.constructor.name === 'RedisClient') {
      this.redis = opt.existingCache;
    } else {
      throw new Error('Expecting an instance of RedisClient');
    }
  } else {
    this.redis = RedisStore._createClient(opt);
  }
  this.redis = opt.existingCache || RedisStore._createClient(opt);
  this.redis.debug_mode = /redis/i.test(process.env.DEBUG);
}

RedisStore._createClient = function createRedisClient(opt){
  var conn = (opt && opt.connection) || {port:'6379',host:'127.0.0.1'};
  return redis.createClient(conn.port, conn.host, opt.options);
};

RedisStore.prototype.get = function (key, cb){
  this.redis.get(key, function(err, entry){
    return cb(err, !entry ? null : CacheEntry.parse(JSON.parse(entry)));
  });
};

RedisStore.prototype.set = function (key, val, cb){
  var entry = JSON.stringify(val);
  this.redis.set(key, entry, cb);
  if (this._options.ttl){
    this.redis.expire(key, this._options.ttl);
  }
};

RedisStore.prototype.delete = function (key, cb){
  this.redis.del(key, cb);
};

RedisStore.prototype.clear = function (cb){
  this.redis.flushdb(cb);
};

RedisStore.prototype.size = function (cb){
  this.redis.dbsize(cb);
};

module.exports = RedisStore;