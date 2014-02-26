var common = require('./common');
var sinon = common.sinon;
var should = common.should;

describe('data store module',function(){
  describe('data store class', function(){
    describe('constructor',function(){
      describe('if request executor not provided in config', function(){
        it('should create instance of default RequestExecutor');
      });

      describe('if request executor was provided in config', function(){
        it('should reuse provided request executor instance');
      });

      describe('if cache options was not provided', function(){
        it('should not create caches');
      });

      var CACHE_REGIONS = ['applications', 'directories', 'accounts', 'groups',
        'groupMemberships', 'tenants', 'accountStoreMappings'];
      describe('for all provided regions', function(){
        it('should create cache instance');
      });
    });

    describe('get resource',function(){
      describe('required params', function(){
        it('should throw error if href is not defined');
        it('should throw error if callback is not defined');
      });

      describe('if href already cached', function(){
        it('should return entry from cache');
      });

      // todo: tbd - ignore cache if query param provided
      describe('if query provided', function(){
        it('should ignore cache');
      });

      describe('if href not found in cache',function(){
        it('request executor should be called once');
        it('and result should be stored in cache');
      });
    });

    describe('create resource',function(){
      describe('params translation to request object', function(){
        it('should translate href to req.uri');
        it('should translate query to req.query');
        it('should translate body to req.body');
      });

      describe('after resource creation', function(){
        it('resource should be stored in cache by href in response');
      });
    });

    describe('save resource',function(){
      describe('transfer params in request', function(){
        it('resource.href -> req.uri');
        it('req.method === POST');
        it('resource -> req.body');
      });

      describe('after resource update', function(){
        it('should be stored in cache');
      });
    });

    describe('delete resource',function(){
      it('should remove entry from cache');
      it('href -> req.uri');
      it('req.method === DELETE');
    });
  });
});