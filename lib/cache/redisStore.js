// todo: create store provider and register redis store only for node.js version

var CacheEntry = require('./entry');

// todo: switch to redis
// https://www.npmjs.org/package/redis
//noinspection JSHint
/**
 * Redis provider stub
 * @param host
 * @param port
 * @param db
 * @constructor
 */
// todo: change to options
function Redis(host, port, db){
  this.get = function get(key,cb){};
  this.set = function set(key,val,cb){};
  this.delete = function del(key,cb){};
  this.flushdb = function clear(cb){};
  this.dbsize = function dbsize(cb){};
}

/**
 * Caching implementation that uses Redis as data storage.
 * @constructor
 * @param {string=} [host='localhost']
 * @param {number=} [port=6379]
 * @param {number=} [db=0]
 */
// todo: what about auth?
// todo: change to options
function RedisStore(host, port, db){
  host = host || 'localhost';
  port = port || 6379;
  db = db || 0;
  this.redis = new Redis(host, port, db);
}

RedisStore.prototype.get = function (key, cb){
  this.redis.get(key, function(err, entry){
    if (err || !entry){
      return cb(err);
    }
    return cb(null, CacheEntry.parse(JSON.parse(entry)));
  });
};

RedisStore.prototype.set = function (key, val, cb){
  var entry = JSON.stringify(val);
  this.redis.set(key, entry, cb);
};

RedisStore.prototype.delete = function (key, cb){
  this.redis.delete(key,cb);
};

RedisStore.prototype.clear = function (cb){
  // todo: check redis implementation of flushdb
  this.redis.flushdb(cb);
};

RedisStore.prototype.size = function (cb){
  this.redis.dbsize(cb);
};
