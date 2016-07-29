'use strict';

var moment = require('moment');

/**
 * @private
 *
 * @description
 *
 * Cache entry abstraction
 * A single entry inside a cache
 *
 * It contains the data as originally returned by Stormpath along
 * with additional metadata like timestamps.
 * @param {object} value - value to store in cache
 * @param {Date=} createdAt - time when cache entry created
 * @param {Date=} lastAccessedAt - time when cache entry was last accessed
 * @constructor
 */
function CacheEntry(value, createdAt, lastAccessedAt){
  this.value = value;
  this.createdAt = createdAt || Date.now();
  this.lastAccessedAt = lastAccessedAt || this.createdAt;

  if (typeof this.createdAt !== 'number' ||
    typeof this.lastAccessedAt !== 'number'){
    throw new Error('Expecting date in timestamp format or use CacheEntry.parse method instead');
  }
}

// todo: what does it do in py: datetime.timedelta
function timedelta(seconds){return seconds * 1000;}

/**
 * Changes last accessed to current
 */
CacheEntry.prototype.touch = function touch(){
  this.lastAccessedAt = Date.now();
};

/**
 * Checks is entry expired due to overdue of live or idle timeouts
 * @param {number=} ttl - time to live
 * @param {number=} tti - time to idle
 * @returns {boolean}
 */
CacheEntry.prototype.isExpired = function isExpired(ttl, tti){
  var now = Date.now();
  return (now >= (this.createdAt + timedelta(ttl))) ||
    (now >= (this.lastAccessedAt + timedelta(tti)));
};

CacheEntry.prototype.toObject = function(){
  function printDate(val){
    return moment.utc(val).format('YYYY-MM-DD HH:mm:ss.SSS');
  }
  return {
    createdAt: printDate(this.createdAt),
    lastAccessedAt: printDate(this.lastAccessedAt),
    value: this.value
  };
};

CacheEntry.parse = function(data){
  function parseDate(val){
    return moment.utc(val).valueOf();
  }
  return new CacheEntry(data.value,
    parseDate(data.createdAt),
    parseDate(data.lastAccessedAt));
};

module.exports = CacheEntry;
