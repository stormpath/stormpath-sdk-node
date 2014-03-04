var common = require('./common');
var _ = common._;
var should = common.should;

describe('Cache module',function(){

  describe('NoCache cache stub', function(){
    var NoCache = require('../lib/cache/noCache');
    var noCache = new NoCache();
    function callToMethod(cache, methodName){
      describe('call to',function(){
        it(methodName+ ' method should return null, null', function(done){
          cache[methodName](function(err, res){
            should.not.exist(err);
            should.not.exist(res);
            done();
          });
        });
      });
    }
    _.each(noCache.prototype, function(method, methodName){
      callToMethod(noCache,methodName);
    });
  });

  // todo: describe when redis store provider will be implemented
  describe('Redis cache store', function(){});
});