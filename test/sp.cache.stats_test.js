var CacheStats = require('../lib/cache/CacheStats');

describe('Cache module',function(){

  // make sens only for single instance!!!
  describe('Cache Stats class', function(){
    var stats = new CacheStats();

    describe('if we put a new entry', function(){
      var putsCounter, sizeCounter;
      before(function(){
         putsCounter = stats.puts;
         sizeCounter = stats.size;
        stats.put(true);
      });
      it('should increase puts counter', function(){
        stats.puts.should.be.equal(putsCounter + 1);
      });
      it('should increase size counter', function(){
        stats.size.should.be.equal(sizeCounter + 1);
      });
    });

    describe('if we put an old entry', function(){
      var putsCounter, sizeCounter;
      before(function(){
         putsCounter = stats.puts;
         sizeCounter = stats.size;

        stats.put(false);
      });
      it('should increase puts counter', function(){
        stats.puts.should.be.equal(putsCounter + 1);
      });
      it('should not increase size counter', function(){
        stats.size.should.be.equal(sizeCounter);
      });
    });

    describe('if we hit an entry', function(){
      var hitsCounter;
      before(function(){
        hitsCounter = stats.hits;

        stats.hit();
      });
      it('should increase hits counter', function(){
        stats.hits.should.be.equal(hitsCounter + 1);
      });
    });

    describe('if we miss a new entry', function(){
      var missesCounter,expirationsCounter;
      before(function(){
        missesCounter = stats.misses;
        expirationsCounter = stats.expirations;

        stats.miss(true);
      });

      it('should increase misses counter',function(){
        stats.misses.should.be.equal(missesCounter + 1);
      });
      it('should increase expirations counter', function(){
        stats.expirations.should.be.equal(expirationsCounter + 1);
      });
    });

    describe('if we miss an expired entry', function(){
      var missesCounter,expirationsCounter;
      before(function(){
        missesCounter = stats.misses;
        expirationsCounter = stats.expirations;

        stats.miss(false);
      });
      it('should increase misses counter', function(){
        stats.misses.should.be.equal(missesCounter + 1);
      });
      it('should not increase expirations counter', function(){
        stats.expirations.should.be.equal(expirationsCounter);
      });
    });

    describe('if we delete an entry from cache', function(){
      var sizeCounter;
      before(function(){
        sizeCounter = stats.size;

        stats.delete();
      });
      it('should decrease size counter', function(){
        stats.size.should.be.equal(sizeCounter - 1);
      });
    });

    describe('if we delete an entry from empty cache', function(){
      before(function(){
        stats.clear();
        stats.delete();
      });
      it('should not decrease size counter', function(){
        stats.size.should.be.equal(0);
      });
    });

    describe('if we clear cache', function(){
      before(function(){
        stats.clear();
      });
      it('should reset size counter', function(){
        stats.size.should.be.equal(0);
      });
    });
  });
});