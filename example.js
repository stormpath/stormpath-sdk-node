'use strict';
var async = require('async');
var assert = require('assert');
var stormpath = require('./lib');

var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

var client = null; //available after the ApiKey is loaded from disk (api key is needed to instantiate the client).

stormpath.loadApiKey(apiKeyFilePath, function (err, apiKey) {
  if (err) throw err;

  client = new stormpath.Client({ apiKey: apiKey });
  client.getCurrentTenant(function (err, tenant) {
    if (err) throw err;
    onTenantReady(tenant);
  });
});

function onTenantReady(tenant) {
  listAppsAndDirs(tenant);
  listAppsAndDirs(client);
  doAppCrud(client);
  doDirCrud(client);
  doCustomDataCrud(client);
  doAccountStoreMappingsCrud(client);
}

function listAppsAndDirs(clientOrTenant) {

  clientOrTenant.getApplications()
    .search('Stormpath')
    .orderBy({name: 1})
    .expand({accounts: {offset: 0, limit: 60}, groups: true})
    .exec(function (err, apps) {
      if (err) throw err;

    apps.each(function iterator(app, cb) {
        console.log(app);

        app.getAccounts(function (err, accts) {
          if (err) throw err;

        accts.each(function iterator(acct, cb) {
            console.log(acct);
          cb();
        }, function callback(err){
          if (err) throw err;
          });
        });

     app.getGroups(function (err, groups) {
          if (err) throw err;

        groups.each(function iterator (group, cb) {
            console.log(group);
          cb();
        }, function callback(err){
          if (err) throw err;
          });
        });

      cb();
    }, function callback(err){
      if (err) throw err;
      });
    });

  clientOrTenant.getDirectories(function (err, dirs) {
    if (err) throw err;

    dirs.each(function iterator(dir, cb) {
      console.log(dir);

      dir.getAccounts(function (err, accts) {
        if (err) throw err;

        accts.each(function iterator (acct, cb) {
          console.log(acct);
          cb();
        }, function callback(err){
          if (err) throw err;
        });
      });

      dir.getGroups(function (err, groups) {
        if (err) throw err;

        groups.each(function iterator(group, cb) {
          console.log(group);
          cb();
        }, function callback(err){
          if (err) throw err;
        });
      });

      cb();
    }, function callback(err){
      if (err) throw err;
    });
  });
}

function doAppCrud(client) {
  client.getCurrentTenant(function (err, tenant) {
    if (err) throw err;

    //Create:
    tenant.createApplication({name: 'Just Testing! Delete me.'}, function onCreateApp(err, app) {
      if (err) throw err;

      console.log(app);

      //Read:
      client.getApplication(app.href, function onReadApp(err, app2) {
        if (err) throw err;

        console.log(app2);

        //Update:
        app2.name = 'Just Testing Again!.  Delete me (really).';
        app2.save(function onSaveApp(err, app3) {
          if (err) throw err;

          console.log(app3);

          //Delete:
          app3.delete(function onDeleteApp(err) {
            if (err) throw err;

            console.log("App deleted!");
          });

        });

      });

    });

  });
}

function doDirCrud(client) {

  client.getCurrentTenant(function (err, tenant) {
    if (err) throw err;

    //Create:
    tenant.createDirectory({name: 'Testing NodeJS SDK. Delete me!'}, function (err, dir) {
      if (err) throw err;

      console.log(dir);

      //Read:
      client.getDirectory(dir.href, function (err, dir2) {
        if (err) throw err;

        console.log(dir2);

        //Update:
        dir2.name = 'Testing NodeJS SDK. Delete me really!';
        dir2.save(function (err, dir3) {
          if (err) throw err;
          console.log(dir3);

          //Delete:
          dir3.delete(function (err) {
            if (err) throw err;
            console.log("Dir deleted!");

          });

        });

      });

    });

  });

}

function doCustomDataCrud(client) {
  client.getApplications()
    .search({name: 'Stormpath'})
    .orderBy({name: 1})
    .expand({accounts: {offset: 0, limit: 1}})
    .exec(function (err, apps) {
      if (err) throw err;
      if (!apps || apps.length === 0) {
        return;
      }
      var app = apps.items[0];
      // create user with custom data
      var accQ = {
        email: Math.floor(Math.random() * 1000000) + '@gmail.com',
        password: 'Aa' + Math.floor(Math.random() * 1000000000),
        givenName: 'Testing',
        surname: 'DeleteMe',
        customData: {
          createAcc: 'with custom data',
          removeMe: 'remove me field'
        }
      };
      console.log('Creating test account');
      app.createAccount(accQ, function (err, acc) {
        if (err) {
          throw err;
        }

        app.authenticateAccount({username: accQ.email, password: accQ.password}, function (err, authRes) {
          if (err) {
            throw err;
          }

          console.log('Account authenticated: ', authRes);
          authRes.getAccount().expand({customData: true}).exec(function (err, acc) {
            if (err) {
              throw err;
            }

            acc.customData.get(function (err, customData) {
              if (err) {
                throw err;
              }

              assert(customData.createAcc, accQ.customData.createAcc);
            });

            acc.customData.remove('removeMe');
            acc.customData.boom = 'test';

            acc.save(function (err, acc) {
              if (err) throw err;

              console.log(acc);

              acc.getCustomData(function (err, customData) {
                if (err) throw err;

                console.log(customData);
                assert.equal(customData.boom, 'test', 'custom data should have field "boom" with value "test" ');
                assert.equal(customData.removeMe, undefined, 'removeMe field should be deleted');

                customData.remove('boom');
                customData.boom2 = 'test2';

                customData.save(function (err, customData) {
                  if (err) {
                    console.log();
                    //throw err;
                  }

                  assert.equal(customData.boom2, 'test2', 'custom data should have field "boom2" with value "test2" ');
                  assert.equal(customData.boom, undefined, 'boom field should be deleted');

                  console.log(customData);

                  acc.delete(function (err) {
                    if (err) {
                      throw err;
                    }

                    console.log('Account deleted');
                  });
                });
              });
            });
          });
        });
      });
    });
}

function doAccountStoreMappingsCrud(client){
  function e(err){
    if(err){
      throw err;
    }
  }

  function w(cb, message){
    return function(err, res){
      e(err);
      console.log(message, res);
      cb(err, res);
    };
  }

  client.getCurrentTenant(function (err, tenant) {
    e(err);
    var acc, app, dirs = [], maps = [];
    var _dirIndex = 0;
    function createApp(cb){
      function _app(err, res){
        app = res;
        cb(err, res);
      }

      tenant.createApplication({name: 'Just Testing ASM! Delete me.' + Math.floor(Math.random() * 1000)}, w(_app, 'Application created: '));
    }

    function createDir(cb){
      function _dir(err, res){
        dirs.push(res);
        cb(err, res);
      }

      tenant.createDirectory({name: 'Testing NodeJS SDK. Delete me! ' + Math.floor(Math.random() * 1000)}, w(_dir, 'Directory created: '));
    }

    function createMapping(cb){
      function _map(err, res){
        maps.push(res);
        cb();
      }
      app.addAccountStore(dirs[_dirIndex++], w(_map, 'add account store: '));
    }

    function getAll(cb){
      async.series([
        function(cb){
          function updateApp(err, _app){
            app = _app;
            cb(err);
          }
          client.getApplication(app.href, w(updateApp, 'get application: '));
        },
        function(cb){
          app.getAccountStoreMappings(w(cb, 'account store mappings store: '));
        },
        function (cb){
          app.getDefaultAccountStore(w(cb, 'default account store: '));
        },
        function (cb){
          app.getDefaultGroupStore(w(cb, 'default group store: '));
        }
      ], cb);
    }

    function do_crud_sample(cb){
      async.series([
        function (cb){
          console.log('Empty: ');
          cb();
        },
        getAll,
        function set(cb){
          async.series([
            createMapping,
            function(cb){
              app.setDefaultAccountStore(dirs[_dirIndex], w(cb, 'set default account store: '));
            },
            function(cb){
              app.setDefaultAccountStore(dirs[_dirIndex].href, w(cb, 'set default account store: '));
            },
            function (cb){
              app.setDefaultGroupStore(dirs[_dirIndex], w(cb, 'set default group store: '));
            },
            function (cb){
              app.setDefaultGroupStore(dirs[_dirIndex].href, w(cb, 'set default group store: '));
            }
          ], cb);
        },
        getAll,
        function getAccountStore (cb){
          maps[0].getAccountStore(w(cb, 'get account store: '));
        },
        function (cb){
          function _acc(err,res){
            acc = res;
            cb();
          }
          // create user with custom data
          var accQ = {
            email: Math.floor(Math.random() * 1000000) + '@gmail.com',
            password: 'Aa' + Math.floor(Math.random() * 1000000000),
            givenName: 'Testing',
            surname: 'DeleteMe'
          };
          app.createAccount(accQ, w(_acc, 'user account created: '));
        }
      ], cb);
    }

    async.series([
      createApp,
      createDir,
      createDir,
      createDir,
      do_crud_sample,
       function deleteDir(cb){
       async.each(dirs, function(dir, cb){ dir.delete(w(cb, 'Dir deleted!'));}, cb);
       },
       function deleteApp(cb){
       app.delete(w(cb, 'App deleted!'));
       }
    ], function cleanUp(err){
      e(err);
    });
  });
}
