/**
 * Cache stats.
 * Represents cache statistic
 * @constructor
 */
function CacheStats(){
  var self = this;

  // todo: debug py to find out content of namedtuple
  //Summary = namedtuple('CacheStats', 'puts hits misses expirations size')
  var Summary = {};

  self.puts = 0;
  self.hits = 0;
  self.misses = 0;
  self.expirations = 0;
  self.size = 0;

  // todo: implement
  Object.defineProperty(self,'summary', {
    get: function(){
      //Summary(self.puts, self.hits, self.misses, self.expirations, self.size)
      return Summary;
    }
  });
}

/**
 *
 * @param {boolean} [_new=true]
 */
CacheStats.prototype.put = function(_new){
  _new = _new === false ? false : true;
  this.puts++;
  if (_new){
    this.size++;
  }
};

CacheStats.prototype.hit = function(){
  this.hits++;
};

CacheStats.prototype.miss = function(expired){
  this.misses++;
  if (expired){
    this.expirations++;
  }
};

CacheStats.prototype.delete = function(){
  if (this.size > 0){
    this.size--;
  }
};

CacheStats.prototype.clear = function(){
  this.size = 0;
};

module.exports = CacheStats;