var common = require('./common');
var sinon = common.sinon;
var should = common.should;
var moment = common.moment;

var CacheEntry = require('../lib/cache/CacheEntry');

function createVoidCacheEntry(){
  var entry = {};
  var createdAt = new Date();
  var lastAccessedAt = new Date();
  var cacheEntry =
    new CacheEntry(entry, createdAt.valueOf(), lastAccessedAt.valueOf());
  return cacheEntry;
}

describe('Cache module',function(){
  describe('Cache Entry class', function(){
    describe('default arguments values ',function(){
      var sandbox;
      var testTime = 100500;
      before(function(){
        sandbox = sinon.sandbox.create();
        sandbox.useFakeTimers(testTime, 'Date');
      });
      after(function(){
        sandbox.restore();
      });

      it('for createdAt an lastAccessedAt should be current utc time tick',
        function(){
          var cacheEntry = new CacheEntry();
          should.not.exist(cacheEntry.value);
          cacheEntry.createdAt.should.be.equal(testTime);
          cacheEntry.lastAccessedAt.should.be.equal(testTime);
        });
    });

    describe('constructor expecting', function(){
      var entry = {};
      var createdAt = new Date();
      var lastAccessedAt = new Date();
      var cacheEntry =
        new CacheEntry(entry, createdAt.valueOf(), lastAccessedAt.valueOf());
      it('should store entry in it initial state', function(){
        cacheEntry.value.should.be.equal(entry);
      });

      it('createdAt in number format', function(){
        cacheEntry.createdAt.should.be.equal(createdAt.valueOf());
      });

      it('lastAccessedAt in number format', function(){
        cacheEntry.lastAccessedAt.should.be.equal(lastAccessedAt.valueOf());
      });
    });

    describe('constructor params validation', function(){
      function createCacheEntry(createdAt, lastAccessedAt){
        return function(){
          return new CacheEntry({},createdAt, lastAccessedAt);
        };
      }
      it('should throw "expecting date in timestamp format"', function(){
        createCacheEntry('boom!')
          .should.throw(/expecting date in timestamp format/i);
        createCacheEntry(1, 'boom!')
          .should.throw(/expecting date in timestamp format/i);
      });
    });

    describe('call to touch method', function(){
      var cacheEntry = createVoidCacheEntry();
      it('should change lastAccessedTime to current for cache entry', function(){
        var was = cacheEntry.lastAccessedAt;

        cacheEntry.touch();

        cacheEntry.lastAccessedAt.should.be.gt(was);
      });
    });

    describe('call to isExpired', function(){
      describe('if entry is fresh', function(){
        var cacheEntry = createVoidCacheEntry();
        it('should not be expired', function(){
          var notExpired = cacheEntry.isExpired(300,300);
          /* jshint -W030 */
          notExpired.should.not.be.true;
        });
      });

      describe('if entry is idle for to long', function(){
        var cacheEntry = createVoidCacheEntry();
        cacheEntry.lastAccessedAt -= 500*1000;
        it('should be expired', function(){
          var expired = cacheEntry.isExpired(300,300);
          /* jshint -W030 */
          expired.should.be.true;
        });
      });

      describe('if entry is created a long time ago', function(){
        var cacheEntry = createVoidCacheEntry();
        cacheEntry.createdAt -= 500*1000;
        it('should be expired', function(){
          var expired = cacheEntry.isExpired(300,300);
          /* jshint -W030 */
          expired.should.be.true;
        });
      });
    });

    describe('call to toObject', function(){
      var cacheEntry = createVoidCacheEntry();
      var expectCreatedAt = moment.utc(cacheEntry.createdAt)
        .format('YYYY-MM-DD HH:mm:ss.SSS');
      var expectLastAccessedAt = moment.utc(cacheEntry.lastAccessedAt)
        .format('YYYY-MM-DD HH:mm:ss.SSS');
      var object = cacheEntry.toObject();
      it('should return current entry state with formatted dates', function(){
        object.createdAt.should.be.equal(expectCreatedAt);
        object.lastAccessedAt.should.be.equal(expectLastAccessedAt);
      });
    });

    describe('call to type method parse', function(){
      var cacheEntry = createVoidCacheEntry();
      var expectCreatedAt = moment.utc(cacheEntry.createdAt)
        .format('YYYY-MM-DD HH:mm:ss.SSS');
      var expectLastAccessedAt = moment.utc(cacheEntry.lastAccessedAt)
        .format('YYYY-MM-DD HH:mm:ss.SSS');
      var parsedCacheEntry = CacheEntry.parse({
        createdAt: expectCreatedAt,
        lastAccessedAt: expectLastAccessedAt});

      it('should return instance of CacheEntry with utc time', function(){
        parsedCacheEntry.createdAt.should.be.equal(cacheEntry.createdAt);
        parsedCacheEntry.lastAccessedAt.should.be.equal(cacheEntry.lastAccessedAt);
      });
    });
  });
});