var common = require('./common');
var sinon = common.sinon;
var should = common.should;

describe('Cache module',function(){
  describe('Cache Entry class', function(){
    describe('default arguments values ',function(){
        it('for createdAt an lastAccessedAt should be current utc time tick');
      });

    describe('constructor expecting', function(){
      it('createdAt in number format');
      it('lastAccessedAt in number format');
    });

    describe('call to touch method', function(){
      it('should change lastAccessedTime to current for cache entry');
    });

    describe('call to isExpired', function(){
      describe('if entry is fresh', function(){
        it('should not be expired');
      });

      describe('if entry is idle for to long', function(){
        it('should be expired');
      });

      describe('if entry is created a long time ago', function(){
        it('should be expired');
      });
    });

    describe('call to toObject', function(){
      it('should return current entry state with formatted dates');
    });

    describe('call to type method parse', function(){
      it('should return instance of CacheEntry with utc time');
    });
  });

  // make sens only for single instance!!!
  describe('Cache Stats class', function(){
    describe('if we put a new entry', function(){
      it('should increase puts counter');
      it('should increase size counter');
    });

    describe('if we put an old entry', function(){
      it('should increase puts counter');
      it('should not increase size counter');
    });

    describe('if we hit an entry', function(){
      it('should increase hits counter');
    });

    describe('if we miss a new entry', function(){
      it('should increase misses counter');
      it('should increase expirations counter');
    });

    describe('if we miss an expired entry', function(){
      it('should increase misses counter');
      it('should not increase expirations counter');
    });

    describe('if we delete an entry from cache', function(){
      it('should decrease size counter');
    });

    describe('if we delete an entry from empty cache', function(){
      it('should not decrease size counter');
    });

    describe('if we clear cache', function(){
      it('should reset size counter');
    });
  });

  describe('Cache class', function(){
    describe('By default',function(){
      it('store should be a MemoryStore');
      it('tti should be equal 300 sec');
      it('ttl should be equal 300 sec');
      it('should initialize stats');
    });

    describe('get entry', function(){
      describe('if entry exists', function(){
        it('should find entry by key');
        it('should increase hit counter');
        it('should reset entry idle time');
      });

      describe('if entry does not exist', function(){
        it('should return null');
      });

      describe('if entry expired', function(){
        it('should increase miss counter');
        it('should delete entry from cache');
        it('should return null');
      });
    });

    describe('put entry', function(){
      describe('By default', function(){
        it('entry should be considered as new');
      });

      describe('if we put an entry', function(){
        it('should be accessible from cache');
        it('should update stats');
      });
    });

    describe('delete entry', function(){
      it('should update stats');
      it('should remove entry from cache');
    });

    describe('clear cache', function(){
      it('should reset stats');
      it('should remove all entries from cache');
    });

    describe('cache size', function(){
      it('should return size of cache');
    });
  });

  describe('Cache Manager class', function(){
    describe('By default', function(){
      it('caches should be empty');
      it('stats should be empty');
    });

    describe('create cache for region',function(){
      it('should create cache instance for region');
      it('should add stats for region');
    });

    describe('get cache by region',function(){
      it('should return cache instance for region');
      it('should return undefined if not found');
    });
  });

  describe('All store adapters', function(){
    it('should implement get,set,delete,clear,size methods');
  });

  describe('NoCache cache stub', function(){
    describe('call to any method',function(){
      it('should return null, null');
    });
  });

  describe('In memory cache store', function(){
    describe('get entry', function(){
      it('should return entry if found');
      it('should return null if not found');
    });

    describe('set entry', function(){
      it('should store value');
      it('stored value should be accessible');
    });
  });

  // todo: describe when redis store provider will be implemented
  describe('Redis cache store', function(){});
});