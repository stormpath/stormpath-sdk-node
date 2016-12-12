'use strict';

function MemoryStore() {

  var store = {};

  this.get = function get(key, cb) {
    return cb(null, store[key]);
  };

  this.set = function set(key, val, cb) {
// console.log('setting store', val)    
    store[key] = val;
// console.log('sssssssstore', JSON.stringify(store, null, 2))    
    return cb(null, val);
  };

  this.delete = function del(key, cb) {
    delete store[key];
    return cb(null);
  };

  this.clear = function clear(cb) {
    store = {};
    cb(null);
  };

  this.size = function dbsize(cb) {
    cb(null, Object.keys(store).length);
  };
}

module.exports = MemoryStore;