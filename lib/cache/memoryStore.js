'use strict';

function MemoryStore() {

  var store = {};

  this.get = function get(key, cb) {
    return cb(null, store[key]);
  };

  this.set = function set(key, val, cb) {
    store[key] = val;
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