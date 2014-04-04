var common = require('./common');
var _ = common._;
var should = common.should;

describe('Cache module',function(){

  describe('DisabledCache cache stub', function(){
    var DisabledCache = require('../lib/cache/DisabledCache');
    var disabledCache = new DisabledCache();
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
    _.each(disabledCache.prototype, function(method, methodName){
      callToMethod(disabledCache,methodName);
    });
  });
});