var stormpath = require('../');
var uuid = require('node-uuid');
var base64 = require('../lib/utils').base64;
var Benchmark = require('benchmark');

console.log('Construct Clients');

// First client is used to create our dummy account, and use
// the default encryption options

var client1 = new stormpath.Client({
  apiKey: new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  )
});

// Second client will use default options, Api Key encryption will be enabled

var client2 = new stormpath.Client({
  apiKey: new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  ),
  apiKeyEncryptionOptions:{
    encryptSecret: false
  }
});

// Third client will disable api key encryption

var client3 = new stormpath.Client({
  apiKey: new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  ),
  apiKeyEncryptionOptions: {
    encryptionKeySize: 128,
    encryptionKeyIterations: 128
  }
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

      suite.add('With encryption ENABLED (default options)       ', {
        defer: true,
        fn: function(deferred){
          invoke(app1,apiKey,function(err){
            if(err){
              throw err;
            }else{
              deferred.resolve();
            }
          });
        }
      });

      client2.getApplication(process.env['STORMPATH_APP_HREF'],function(err,app2) {

        if(err){ throw err; }

        // Make an initial invocation to warm the cache

        invoke(app2,apiKey,function(err){

          if(err){ throw err; }
          suite.add('With encryption DISABLED (encryptSecret: false) ', {

            defer: true,
            fn: function(deferred){
              invoke(app2,apiKey,function(err){
                if(err){
                  throw err;
                }else{
                  deferred.resolve();
                }
              });
            }
          });
        });

        client3.getApplication(process.env['STORMPATH_APP_HREF'],function(err,app3) {

          if(err){ throw err; }

          // Make an initial invocation to warm the cache

          invoke(app3,apiKey,function(err){
            if(err){ throw err; }
            suite.add('With light encryption (128 key size, iterations)', {

              defer: true,
              fn: function(deferred){
                invoke(app3,apiKey,function(err){
                  if(err){
                    throw err;
                  }else{
                    deferred.resolve();
                  }
                });
              }
            });
            suite.run({ 'async': true });
          });
        });
      });
    });
  });
});
