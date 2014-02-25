function MemoryStore(){
  var store = {};
  this.get = function get(key,cb){
    // todo: CacheEntry.parse? + JSON.parse
    return cb(null, store[key]);
  };

  this.set = function set(key,val,cb){
    // todo: JSON.stringify?
    store[key] = val;
    return cb(null, true);
  };

  this.delete = function del(key,cb){
    delete store[key];
    return cb(null, true);
  };

  this.clear = function clear(cb){
    // possible memory leaks
    store = {};
  };

  this.size = function dbsize(cb){
    cb(null, Object.keys(store).length);
  };
}

module.exports = MemoryStore;