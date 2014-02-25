/**
 * Cache entry abstraction
 * A single entry inside a cache
 *
 * It contains the data as originally returned by Stormpath along
 * with additional metadata like timestamps.
 * @param {object} value
 * @param {Date=} createdAt
 * @param {Date=} lastAccessedAt
 * @constructor
 */
function CacheEntry(value, createdAt, lastAccessedAt){
  var self = this;
  self.value = value;
  self.createdAt = createdAt || Date.now();
  self.lastAccessedAt = lastAccessedAt || self.createdAt;

  if (typeof self.createdAt !== 'number' ||
    typeof self.lastAccessedAt !== 'number'){
    throw new Error('Expecting date in timestamp format or use CacheEntry.parse method instead');
  }
}

// todo: what does it do in py: datetime.timedelta
function timedelta(seconds){return seconds * 1000;}

CacheEntry.prototype.touch = function touch(){
  var self = this;
  self.lastAccessedAt = Date.now();// datetime.utcnow()
};

CacheEntry.prototype.isExpired = function isExpired(ttl, tti){
  var self = this;
  var now = Date.now();
  return (now >= (self.createdAt + timedelta(ttl))) ||
    (now >= (self.lastAccessedAt + timedelta(tti)));
};


CacheEntry.parse = function(data){
  function parseDate(val){
    if (!val) {
      return null;
    }
    if (val instanceof Date) {
      return val.getTime();
    }
    try{
      if (typeof val === 'string'){
        val += /[+-]/.test(val) ? '' : ' GMT +0000';
      }
      return (new Date(val)).getTime();
    } catch (e){
      return null;
    }
  }
  return new CacheEntry(data.value, parseDate(data.createdAt), parseDate(data.lastAccessedAt));
};

CacheEntry.toDict = function(){
  function printDate(val){
    // val.strftime('%Y-%m-%d %H:%M:%S.%f')
    var d = new Date(val);
    // todo: add two digits function to utils.date!
    return d.getUTCFullYear() + '-' + (d.getUTCMonth()+1) + '-' + d.getUTCDay() + ' ' +
      d.getUTCHours() + ':' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + '.' + d.getUTCMilliseconds();
  }
  return {
    createdAt: printDate(this.createdAt),
    lastAccessedAt: printDate(this.lastAccessedAt),
    value: this.value
  };
};

module.exports = CacheEntry;