var stormpath = require('../');
var uuid = require('node-uuid');
var base64 = require('../lib/utils').base64;
var Benchmark = require('benchmark');
var async = require('async');

function invoke(app,apiKey,cb){
  app.authenticateApiRequest({
    request:{
      method: 'GET',
      url: '/',
      headers:{
        'authorization': 'Basic '+ base64.encode(apiKey.id+':'+apiKey.secret)
      }
    }
  },cb);
}

function addTestRunner(apiKey,test,suite,done){
  var client = new stormpath.Client({
    apiKey: new stormpath.ApiKey(
      process.env['STORMPATH_API_KEY_ID'],
      process.env['STORMPATH_API_KEY_SECRET']
    ),
    apiKeyEncryptionOptions: test.apiKeyEncryptionOptions
  });

  client.getApplication(process.env['STORMPATH_APP_HREF'],function(err,app) {

    if(err){ throw err; }

    // Make an initial invocation to warm the cache

    invoke(app,apiKey,function(err){
      if(err){ throw err; }
      suite.add(test.title, {
        defer: true,
        fn: function(deferred){
          invoke(app,apiKey,function(err){
            if(err){
              throw err;
            }else{
              deferred.resolve();
            }
          });
        }
      });
      done();
    });
  });
}



var tests = [
  {
    title: 'With encryption DISABLED (encryptSecret: false)  ',
    apiKeyEncryptionOptions: {
      encryptSecret: false
    }
  },
  {
    title: 'With encryption ENABLED (default options)        '
  },
  {
    title: 'With light encryption (128 key size, iterations) ',
    apiKeyEncryptionOptions: {
      encryptionKeySize: 128,
      encryptionKeyIterations: 128
    }
  },
  {
    title: 'With medium encryption (128 key size, iterations)',
    apiKeyEncryptionOptions: {
      encryptionKeySize: 256,
      encryptionKeyIterations: 512
    }
  }
];


console.log('Construct Client');

// First client is used to create our dummy account

var client1 = new stormpath.Client({
  apiKey: new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  )
});


var account;


var suite = new Benchmark.Suite('api auth')
  .on('start', function() {
    console.log('Begin benchmarks');
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('\nFastest is: ' + this.filter('fastest').pluck('name')+'\n');
    account.delete(function(err){
      if(err){ throw err; }
      console.log('Deleted account');
    });
  });


client1.getApplication(process.env['STORMPATH_APP_HREF'],function(err,app1) {

  if(err){ throw err; }

  console.log('Create test account');

  app1.createAccount({
    email: uuid()+'@stormpath.com',
    password: uuid() + 'ABC1',
    givenName: uuid(),
    surname: uuid()
  },function(err,result){

    if(err){ throw err; }

    account = result;

    account.createApiKey(function(err,apiKey){

      if(err){ throw err; }

        async.parallel(tests.map(function(test){
          return addTestRunner.bind(null,apiKey,test,suite);
        }),function(err){
          if(err){ throw err; }
          suite.run({async:true});
        });

    });
  });
});
